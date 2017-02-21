// @flow
import React, {Component, Children, cloneElement, Element, PropTypes} from 'react';
import {List, Map} from 'immutable';
import Svg from './Svg';
import ChartData from '../chartdata/ChartData';
import applyDimension from '../util/applyDimension';
import defaultScale from '../util/defaultScale';
import scaleChartRow from '../util/scaleChartRow';
import memoize from '../util/memoize';
import {SpruceClassName} from 'stampy';

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
    getAxisSize: Function;
    getCanvasSize: Function;
    getChildProps: Function;
    withScaledData: Function;
    memoize: Function;
    memos: Object;
    state: Object;

    static propTypes = {
        data: PropTypes.object.isRequired,

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

    static defaultProps = {
        dimensions: ['x','y']
    }

    constructor(props: Object) {
        super(props);

        const childrenProps = Children
            .map(props.children, (child: Element<any>): Object => {
                return {
                    ...child.props,
                    chartType: child.type.chartType
                };
            });

        this.memos = {};
        this.state = {
            dimensions: props.dimensions
                .map((dimensionName: string): Object => {
                    const columnKey = `${dimensionName}Column`;
                    const scaleKey = `${dimensionName}Scale`;
                    const scaleTypeKey = `${dimensionName}ScaleType`;
                    const scaleGroupKey = `${dimensionName}ScaleGroup`;

                    return {
                        columnKey,
                        dimensionName,
                        scaleKey,
                        scaleTypeKey,
                        scaleGroupKey,
                        groups: List(childrenProps)
                            .groupBy(ii => ii[scaleGroupKey] || dimensionName)
                            .map((groupList: List): string[] => {
                                return groupList
                                    .map(ii => List([].concat(ii[columnKey]).concat(props[columnKey])))
                                    .flatten(1)
                                    .toSet()
                                    .filter(ii => ii)
                                    .toArray();
                            })
                    };
                })
        };

        this.getAxisSize = this.getAxisSize.bind(this);
        this.getCanvasSize = this.getCanvasSize.bind(this);
        this.getChildProps = this.getChildProps.bind(this);
        this.withScaledData = this.withScaledData.bind(this);
        this.memoize = memoize(this.memos);
    }
    memoize(key: String, fn: Function): Object[] {
        if(this.memos.has(key)) {
            return this.memos.get(key);
        }
        const value = fn();
        this.memos = this.memos.set(key, value);
        return value;
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
    withScaledData(dimension: Object, chartProps: Object): Function {
        const {columnName, dimensionName} = applyDimension(dimension, chartProps.toObject());
        return (newProps: Map): Map => {
            // scaled data is calculated halfway through the newProps construction
            // we must merge the current newProps and chartProps to have access to all data.
            const props = chartProps.merge(newProps);

            //ignore inherited columns we aren't up to yet. (They have no value for this dimension)
            if(columnName) {

                // memoize the calculation of data by dimension & columnName.
                return newProps.setIn(['scaledData', dimensionName], this.memoize(`${dimensionName}${columnName}`, (): Array<any> => {
                    return chartProps.get('data').rows
                        // iterate and scale
                        .map(scaleChartRow(dimension, props.toObject()))
                        .toArray();
                }));
            }
            return newProps;
        };
    }
    getChildProps(props: Object): Object {
        const {dimensions} = this.state;
        const chartProps = Object.assign({}, this.state, this.props, this.getCanvasSize(), props);

        return List(dimensions)
            .reduce((newProps: Map, dimension: Object): Map => {
                const {scaleKey, columnKey} = dimension;
                const {scaleName, columnName} = applyDimension(dimension, chartProps);
                const scale = defaultScale(dimension, chartProps);

                return newProps
                    .set(columnKey, columnName)
                    .set(scaleKey, typeof scaleName === 'function' ? scaleName(scale.copy(), chartProps) : scale);
            }, Map())
            .set('data', props.frame || chartProps.data)
            .set('width', chartProps.width)
            .set('height', chartProps.height)
            .update(scaleChartRow(dimensions))
            .toObject();
    }
    render(): Element<any> {
        const {width, height, outerWidth, outerHeight, top, left} = this.getCanvasSize();

        const {
            className,
            modifier,
            spruceName: name = 'PnutChart'
        } = this.props;

        const scaledChildren = List(Children.toArray(this.props.children))
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
