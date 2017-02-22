// @flow
import React, {Component, Children, cloneElement, Element, PropTypes} from 'react';
import {List, Map, Set} from 'immutable';
import Svg from './Svg';
import applyDimension from '../util/applyDimension';
import applyPrimitiveDimensionProps from '../util/applyPrimitiveDimensionProps';
import defaultScale from '../util/defaultScale';
import memoize from '../util/memoize';
import {SpruceClassName} from 'stampy';

import ChartData from '../chartdata/ChartData';
import type ChartRow from 'src/chartdata/ChartData';

/**
 * @component
 *
 * Chart is an organizer for D3's scales. Using the dimensions array it constructs a number of
 * scales. It checks its children's props and applies to them the scale configurations it found.
 *
 * Each scale creates 4 dynamic props on the Chart and each of it's children.
 *  * &lt;dimensionName&gt;Column
 *  * &lt;dimensionName&gt;ScaleType
 *  * &lt;dimensionName&gt;ScaleGroup
 *  * &lt;dimensionName&gt;Scale
 *
 * Each child will inherit any of these dimension props from the Chart component.
 * While declaring them on the child will override the parent value. This lets you declare common axis on the
 * Chart component and specific axis on the relevant child. This flexibility makes chart construction
 * expressive and highly customizable.
 *
 * ```
 * <Chart data={data} xColumn="time">
 *     <Line yColumn="distance"/>
 *     <Line yColumn="velocity"/>
 *     <Axis dimension="y" position="left" />
 *     <Axis dimension="x" position="bottom" />
 * </Chart>
 * ```
 *
 *
 * @prop {string} <dimensionName>Column
 * Picks the dimension of ChartData that this scale corresponds to.
 * e.g. `<Chart dimensions={['x', 'y', 'color']} xColumn="time" yColumn="distance" colorColumn="velocity" />`
 *
 * @prop {string} [<dimensionName>ScaleType = scaleLinear]
 * Picks the starting D3 scale
 * e.g. `<Chart xScaleType="scalePoint" yScaleType="scaleLinear" />`
 *
 * @prop {function} [<dimensionName>Scale]
 * Called with scale and props after the default scale has been constructed
 * e.g. `<Chart xScaleType={scale => scale.padding(.1)} />`
 *
 * @prop {function} [<dimensionName>ScaleGroup]
 * Sometimes a dimension might have multiple scales. Scale groups isolate columns into different scales.
 * Usage examples might be a correlation graph with independent y axes.
 *
 *
 * @example
 *
 * // Line chart
 * <Chart data={data} xColumn="time">
 *     <Line yColumn="distance"/>
 *     <Axis yColumn="distance" position="left" />
 *     <Axis xColumn="time" position="bottom" />
 * </Chart>
 *
 * // Column chart
 * <Chart data={data} xColumn="favoriteColor">
 *     <Column yColumn="people"/>
 * </Chart>
 *
 * // Point scale scatter plot
 * <Chart data={data} xColumn="favColor" xScaleType="scalePoint">
 *     <Line yColumn="distance"/>
 * </Chart>
 *
 * // Extended scale (column chart with extra padding)
 * <Chart data={data} xColumn="favoriteColor" xScale={scale => scale.padding(1)}>
 *     <Column yColumn="people"/>
 * </Chart>
 *
 * // Complete custom scale
 * var customScale = (scale, props) => {
 *     return scaleLog()
 *          .domain([props.data.min('distance'), pp.data.max('distance')])
 *          .range([0, props.height]);
 * }
 * <Chart data={data} xColumn="time" yScale={customScale}>
 *     <Line yColumn="distance"/>
 * </Chart>
 */
class Chart extends Component {
    chartType: string;
    getAxisSize: Function;
    getCanvasSize: Function;
    getChildProps: Function;
    memoize: Function;
    memos: Object;
    dimensions: Map;
    scaledData: Map;
    state: Object;

    static propTypes = {
        // data: PropTypes.object.isRequired,

        /**
         * Dimensions to construct scales off
         */
        dimensions: PropTypes.arrayOf(PropTypes.string).isRequired,

        /**
         * Total height of the chart.
         */
        height: PropTypes.number.isRequired,

        /**
         * Total width of the chart
         */
        width: PropTypes.number.isRequired,

        /**
         * [top, right, bottom, left] Padding for axis and things.
         * Renderable height is: height - top - bottom.
         * Renderable width is: width - left - right.
         */
        padding: PropTypes.arrayOf(PropTypes.number)
    };

    static chartType = 'canvas';

    static defaultProps = {
        dimensions: ['x','y']
    }

    constructor(props: Object) {
        super(props);

        this.memos = {};
        this.dimensions = this.getDimensions(props);
        this.scaledData = this.getScaledData(props);

        console.log(this.dimensions);
        console.log(this.scaledData);

        this.getAxisSize = this.getAxisSize.bind(this);
        this.getCanvasSize = this.getCanvasSize.bind(this);
        this.getChildProps = this.getChildProps.bind(this);
        this.memoize = memoize(this.memos);
    }
    componentWillReceiveProps(nextProps: Object) {
        this.dimensions = this.getDimensions(nextProps);
        this.scaledData = this.getScaledData(nextProps);
    }
    getDimensions(props: Object): Object {

        // collect the children propTypes and merge chartType
        const childrenProps = Children.toArray(props.children)
            .map((child: Element<any>): Object => {
                // make each child inherit chart.props
                return Map({
                    ...props,
                    ...child.props,
                    chartType: child.type.chartType
                });
            });

        return props
            .dimensions
            // turn dimension array into dimension map
            .reduce((groups: Map, dimensionName: string): Object => {
                const columnKey = `${dimensionName}Column`;
                const scaleKey = `${dimensionName}Scale`;
                const scaleTypeKey = `${dimensionName}ScaleType`;
                const scaleGroupKey = `${dimensionName}ScaleGroup`;

                const columns = List(childrenProps)
                    // concat default columns onto child columns
                    .map((child: Map): List<string> => {
                        return List()
                            .concat(child.get(columnKey))
                            .concat(props[columnKey]);
                    })
                    .flatten(1)
                    .toSet()
                    .filter(ii => ii);

                const dimension = Map({
                    columnKey,
                    scaleKey,
                    scaleTypeKey,
                    scaleGroupKey,
                    columns,
                    scales: columns.reduce((scales: Map, column: string, key: string, columns: Set): Map => {
                        // to calculate the scale you need
                        // primitiveDimension (range)
                        // columns (domain)
                        // scaleType
                        // primitiveDimensionProps (range)
                        // data (domain)
                        return scales.set(column, defaultScale({
                            primitiveDimension: dimensionName,
                            columns: columns,
                            scaleType: props[scaleTypeKey],
                            primitiveDimensionProps: applyPrimitiveDimensionProps(dimensionName, props),
                            data: props.data
                        }));
                    }, Map())
                });

                // group children by their scaleGroup name (defaults to dimensionName)
                return groups.set(dimensionName, dimension);
            }, Map());
    }
    getScaledData(props: Object): List {
        return props.data.rows.map((row: ChartRow): Map => {
            return this.dimensions.map((dimension: Map): Map => {
                return dimension
                    .get('scales')
                    .map((scale: Function, value: string): * => {
                        return scale(row.get(value));
                    });
            })
        });
    }
    getCanvasSize(): Object {
        const {width, height, padding = []} = this.props;
        // $FlowBug: flow cant handle default assignment on array destructuring
        const [top = 0, right = 0, bottom = 0, left = 0] = padding;

        return {
            width: Math.max(width - left - right, 0), // clamp negatives
            height: Math.max(height - top - bottom, 0), // clamp negatives
            outerWidth: width,
            outerHeight: height,
            top,
            right,
            bottom,
            left
        };
    }
    getAxisSize(axisType: string): Object {
        const {top, right, bottom, left, width, height} = this.getCanvasSize();
        switch(axisType) {
            case 'top':
                return {
                    width,
                    height: top
                };

            case 'right':
                return {
                    width: right,
                    height
                };

            case 'bottom':
                return {
                    width,
                    height: bottom
                };

            case 'left':
                return {
                    width: left,
                    height
                };

            default:
                return {};

        }
    }
    getChildProps(props: Object): Object {
        const inheritedProps = Map({
            ...this.props,
            ...this.getCanvasSize(),
            ...props
        });
        console.log(inheritedProps);
        const getters = this.dimensions
            .map((dimension: Map, dimensionName: string): Map => {

                const {scaleName, scaleTypeName} = applyDimension(dimension, Map(props)).toObject();

                // if child has defined either a custom scale or scaleType
                // the getter needs to recreate the scaledValue based on the custom props
                if(scaleName || scaleTypeName) {
                    console.log('custom getter', dimensionName, scaleName, scaleTypeName);
                    const scale = defaultScale({
                        primitiveDimension: dimensionName,
                        columns: this.dimensions.getIn([dimensionName, 'columns']),
                        scaleType: scaleTypeName,
                        primitiveDimensionProps: applyPrimitiveDimensionProps(dimensionName, inheritedProps.toObject()),
                        data: inheritedProps.get('data')
                    });

                    // if custom scale is a function apply pass the default scale through it.
                    const customScale = typeof scaleName === 'function' ? scaleName(scale.copy(), inheritedProps.toObject()) : scale;
                    return (index: number, key: string) => customScale(inheritedProps.getIn(['data', 'rows', index, key]));
                }

                // defualt getter just gets from scaledData via a index => dimensionName => key
                return (index: number, key: string): * => this.scaledData.getIn([index, dimensionName, key]);
            });

        const newData = inheritedProps.getIn(['data', 'rows'])
            // map rows
            .map((row: ChartRow, index: number): List<Object> => {
                // then dimensions
                return this.dimensions
                    .map((dimension: Map, dimensionName: string): Map => {
                        const appliedDimension = applyDimension(dimension, inheritedProps);
                        return getters.get(dimensionName)(index, appliedDimension.get('columnName'));
                    });
            });

        console.log(newData);

        return this.dimensions
            .mapEntries((entries: Array<any>): Array<any> => {
                const [dimensionName, dimension] = entries;
                return [`${dimensionName}Scale`, dimension.get('scales').first()];
            })
            .set('data', props.frame || inheritedProps.get('data'))
            .set('width', inheritedProps.get('width'))
            .set('height', inheritedProps.get('height'))
            .toObject();

        // return List(dimensions)
        // return List(dimensions)
        //     .reduce((newProps: Map, dimension: Object): Map => {
        //         const {scaleKey, columnKey} = dimension;
        //         const {scaleName, columnName} = applyDimension(dimension, chartProps);
        //         const scale = defaultScale(dimension, chartProps);

        //         return newProps
        //             .set(columnKey, columnName)
        //             .set(scaleKey, typeof scaleName === 'function' ? scaleName(scale.copy(), chartProps) : scale);
        //     }, Map())
        //     .set('data', props.frame || chartProps.data)
        //     .set('width', chartProps.width)
        //     .set('height', chartProps.height)
        //     .toObject();
    }
    render(): Element<any> {
        const {width, height, outerWidth, outerHeight, top, left} = this.getCanvasSize();

        const {
            className,
            modifier,
            spruceName: name = 'PnutChart'
        } = this.props;

        const childList = List(Children.toArray(this.props.children));

        const scaledChildren = childList
            .map((child: Element<any>): Element<any> => {
                const {chartType} = child.type;
                const childProps = {
                    ...child.props,
                    chartType
                };
                switch(chartType) {
                    case 'axis':
                        return cloneElement(child, {
                            ...this.getChildProps(childProps),
                            ...this.getAxisSize(childProps.position)
                        });

                    case 'canvas':
                    default:
                        return cloneElement(child, this.getChildProps(childProps));
                }
            })
            .groupBy(child => child.type.chartType)
            .updateIn(['axis'], (ii: ?List): ?Map => {
                if(ii) {
                    return ii.groupBy(aa => aa.props.position);
                }
            });


        function getAxis(key: string, x: number, y: number): ?Element<any> {
            const axis = scaledChildren.getIn(['axis', key, 0]);
            if(axis) {
                return <Svg x={x} y={y} height={axis.props.height} width={axis.props.width}>
                    {scaledChildren.getIn(['axis', key]).toArray()}
                </Svg>;
            }
        }

        return <Svg
            className={SpruceClassName({name, modifier, className})}
            width={outerWidth}
            height={outerHeight}
        >
            {getAxis('top', left, 0)}
            {getAxis('right', left + width, top)}
            {getAxis('bottom', left, height + top)}
            {getAxis('left', 0, top)}
            <Svg x={left} y={top} width={width} height={height}>
                {scaledChildren.get('canvas')}
            </Svg>
        </Svg>;
    }
}

export default Chart;
