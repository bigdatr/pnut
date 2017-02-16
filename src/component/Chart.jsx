// @flow
import React, {Component, Children, cloneElement, Element, PropTypes} from 'react';
import {List, Map, Set} from 'immutable';
import Svg from './Svg';
import * as d3Scale from 'd3-scale';
import {SpruceClassName} from 'stampy';


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
    state: Object;
    getChildProps: Function;
    getCanvasSize: Function;
    getAxisSize: Function;

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

        const canvas = List(childrenProps)
            .groupBy(ii => ii.chartType)
            .get('canvas');

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
                        groups: canvas
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

        this.getChildProps = this.getChildProps.bind(this);
        this.getCanvasSize = this.getCanvasSize.bind(this);
        this.getAxisSize = this.getAxisSize.bind(this);
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
    getDefaultScale(dimension: Object): Function {
        const {dimensionName, scaleTypeKey, scaleGroupKey, columnKey, groups} = dimension;

        switch(dimensionName) {
            case 'x':
            case 'y':
                return (pp: Object): Function => {

                    // choose the max value of range based on x/width y/height
                    const bound = (dimensionName === 'x') ? pp.width : pp.height;
                    // Make the current dimension always a list
                    const currentDimension = List().concat(pp[columnKey]);
                    const columns = groups.get(pp[scaleGroupKey] || dimensionName);

                    // create a set of booleans to check if a group is mixing dimension types
                    function isContinuous(list: List): Set {
                        return list
                            .map(dd => pp.data.columns.getIn([dd, 'isContinuous']))
                            .toSet();
                    }

                    // if the size is greater than one we have multiple data types
                    if(isContinuous(List(columns)).size > 1) {
                        throw new Error(`${columnKey} cannot share continuous and non continuous data: ${groups.get(scaleGroupKey).join(', ')}`);
                    }

                    // continuous data domain array is just [min,max]
                    // non continuous domain array has one item for each discrete point
                    if(isContinuous(currentDimension).get(true)) {
                        return d3Scale[pp[scaleTypeKey] || 'scaleLinear']()
                            .domain([pp.data.min(columns), pp.data.max(columns)])
                            .range([0, bound]);


                    } else {
                        return d3Scale[pp[scaleTypeKey] || 'scaleBand']()
                            // only fetch the data if is going to exist. Otherwise send and empty array
                            .domain(pp[columnKey] ? pp.data.getColumnData(currentDimension.get(0)).toArray() : [])
                            .range([0, bound]);
                    }

                };

            default:
                return (pp: Object): Function => {
                    return d3Scale[pp[scaleTypeKey] || 'scaleLinear']();
                };
        }
    }
    getChildProps(props: Object): Object {
        const {dimensions} = this.state;
        const chartProps = Object.assign({}, this.state, this.props, this.getCanvasSize(), props);

        return List(dimensions)
            .reduce((props: Map, dimension: Object): Map => {
                const {scaleKey, columnKey} = dimension;
                const scale = this.getDefaultScale(dimension)(chartProps);
                const editScale = chartProps[scaleKey];

                return props
                    .set(scaleKey, typeof editScale === 'function' ? editScale(scale.copy(), chartProps) : scale)
                    .set(columnKey, chartProps[columnKey]);

            }, Map())
            .set('data', chartProps.data)
            .set('width', chartProps.width)
            .set('height', chartProps.height)
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
