// @flow
import React, {Component, Children, cloneElement, Element, PropTypes} from 'react';
import {List, Map, Set} from 'immutable';
import Svg from './Svg';
import applyDimension from '../util/applyDimension';
import applyScaledValue from '../util/applyScaledValue';
import applyPrimitiveDimensionProps from '../util/applyPrimitiveDimensionProps';
import defaultScale from '../util/defaultScale';
import memoize from '../util/memoize';
import {SpruceClassName} from 'stampy';

import type ChartRow from 'src/chartdata/ChartData';

// TODO: memoize

/**
 * @component
 *
 * Chart is an organizer for D3's scales. Using the dimensions array it constructs a number of
 * scales. It checks its children's props and applies to them the scale configurations it found.
 *
 * Each scale creates 4 dynamic props on the Chart and each of it's children.
 *  * &lt;dimensionName&gt;Column
 *  * &lt;dimensionName&gt;ScaleType
 *  * &lt;dimensionName&gt;ScaleUpdate
 *
 * Each child will inherit any of these dimension props from the Chart component.
 * While declaring them on the child will override the parent value. This lets you declare common axis on the
 * Chart component and specific axis on the relevant child. This flexibility makes chart construction
 * expressive and highly customizable.
 *
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
 * @prop {function} [<dimensionName>ScaleUpdate]
 * Called with scale and props after the default scale has been constructed
 * e.g. `<Chart xScaleUpdate={scale => scale.padding(.1)} />`
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
 * <Chart data={data} xColumn="time" yScaleUpdate={customScale}>
 *     <Line yColumn="distance"/>
 * </Chart>
 *
 *
 * // Correlated Scales
 * <Chart xColumn="days">
 *    <Axis dimension="x"/>
 *    <Chart yColumn="piracy">
 *        <Line/>
 *        <Axis dimension="y"/>
 *    </Chart>
 *    <Chart yColumn="lemonImports">
 *        <Line/>
 *        <Axis dimension="y"/>
 *    </Chart>
 * </Chart>
 */
class Chart extends Component {
    chartType: string;
    applyCanvasSize: Function;
    getChildProps: Function;
    memoize: Function;
    memos: Object;
    dimensions: Map;
    scaledData: Map;
    state: Object;

    static propTypes = {
        /**
         * Dimensions to construct scales off
         */
        dimensions: PropTypes.arrayOf(PropTypes.string),

        /**
         * Total height of the chart.
         */
        height: PropTypes.number,

        /**
         * Total width of the chart
         */
        width: PropTypes.number,

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

        this.applyCanvasSize = this.applyCanvasSize.bind(this);
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
                const scaleUpdateKey = `${dimensionName}ScaleUpdate`;

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
                    columns,
                    scaleKey,
                    scaleTypeKey,
                    scaleUpdateKey,
                    scales: columns.reduce((scales: Map, column: string, key: string, columns: Set): Map => {
                        const scaleUpdate = typeof props[scaleUpdateKey] === 'function' ? props[scaleUpdateKey] : scale => scale;
                        // to calculate the scale you need
                        // primitiveDimension (range)
                        // columns (domain)
                        // scaleType
                        // primitiveDimensionProps (range)
                        // data (domain)

                        // set(scaleUpdate(defaultScale, props))
                        return scales.set(
                            column,
                            scaleUpdate(
                                defaultScale({
                                    primitiveDimension: dimensionName,
                                    columns: columns,
                                    scaleType: props[scaleTypeKey],
                                    primitiveDimensionProps: applyPrimitiveDimensionProps(dimensionName, this.applyCanvasSize(props)),
                                    data: props.data
                                }),
                                props
                            )
                        );
                    }, Map())
                });

                // group children by their scaleGroup name (defaults to dimensionName)
                return groups.set(dimensionName, dimension);
            }, Map());
    }
    getScaledData(props: Object): List {
        const data = props.frame || props.data;
        return data.rows.map((row: ChartRow): Map => {
            return this.dimensions.map((dimension: Map, dimensionName: string): Map => {
                return dimension
                    .get('scales')
                    .map((scale: Function, value: string): * => {
                        return applyScaledValue(dimensionName, scale, row.get(value), this.applyCanvasSize(props));
                    });
            });
        });
    }
    applyCanvasSize(props: Object): Object {
        const {width, height, padding = []} = props;
        // $FlowBug: flow cant handle default assignment on array destructuring
        const [top = 0, right = 0, bottom = 0, left = 0] = padding;

        if(props.childChart) {
            return {
                ...props,
                width,
                height,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            };
        }

        return {
            ...props,
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
    getChildProps(props: Object): Object {
        const inheritedProps = Map(this.applyCanvasSize({
            ...this.props,
            ...props
        }));

        const getters = this.dimensions
            .map((dimension: Map, dimensionName: string): Map => {

                const {scaleUpdate, scaleTypeName} = applyDimension(dimension, Map(props)).toObject();

                // if child has defined either a custom scale or scaleType
                // the getter needs to recreate the scaledValue based on the custom props
                if(scaleUpdate || scaleTypeName) {
                    const scale = defaultScale({
                        primitiveDimension: dimensionName,
                        columns: this.dimensions.getIn([dimensionName, 'columns']),
                        scaleType: scaleTypeName,
                        primitiveDimensionProps: applyPrimitiveDimensionProps(dimensionName, inheritedProps.toObject()),
                        data: inheritedProps.get('data')
                    });


                    return (index: number, key: string): * => {
                        const value = inheritedProps.get('frame', inheritedProps.get('data')).getIn(['rows', index, key]);

                        // if custom scale is a function apply pass the default scale through it.
                        const customScale = typeof scaleUpdate === 'function' ? scaleUpdate(scale.copy(), inheritedProps.toObject()) : scale;

                        return applyScaledValue(dimensionName, customScale, value, inheritedProps.toObject());
                    };
                }

                // defualt getter just gets from scaledData via a index => dimensionName => key
                // the primitive dimension quirks have already been applied via applyScaledValue
                return (index: number, key: string): * => this.scaledData.getIn([index, dimensionName, key]);
            });

        const scaledData = inheritedProps.get('frame', inheritedProps.get('data')).rows
            // map rows
            .map((row: ChartRow, index: number): List<Object> => {
                // then dimensions
                return this.dimensions
                    .map((dimension: Map, dimensionName: string): Map => {
                        const appliedDimension = applyDimension(dimension, inheritedProps);
                        return getters.get(dimensionName)(index, appliedDimension.get('columnName'));
                    })
                    .toObject();
            })
            .toArray();

        return inheritedProps
            .set('scaledData', scaledData)
            .set('childChart', true)
            .merge(this.dimensions.mapEntries((entries: Array<any>): Array<any> => {
                const [dimensionName, dimension] = entries;
                return [`${dimensionName}Scale`, dimension.get('scales').first()];
            }))
            .toObject();
    }
    render(): Element<any> {
        const {width, height, outerWidth, outerHeight, top, left, stroke = 'black'} = this.applyCanvasSize(this.props);

        const {
            className,
            modifier,
            spruceName: name = 'PnutChart'
        } = this.props;


        const scaledChildren = List(Children.toArray(this.props.children))
            .map((child: Element<any>): Element<any> => {
                return cloneElement(child, this.getChildProps({
                    ...child.props,
                    chartType: child.type.chartType
                }));
            })
            .toArray();

        const chart = <Svg x={left} y={top} width={width} height={height}>
            {scaledChildren}
        </Svg>;


        if(this.props.childChart) {
            return chart;
        }

        return <Svg
            stroke={stroke}
            className={SpruceClassName({name, modifier, className})}
            width={outerWidth}
            height={outerHeight}
            children={chart}
        />;
    }
}

export default Chart;
