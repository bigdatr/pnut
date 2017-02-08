// @flow
import React, {Component, Children, cloneElement, Element, PropTypes} from 'react';
import {List, Map, Set} from 'immutable';
import Canvas from './canvas/Canvas';
import * as d3Scale from 'd3-scale';


/**
 * @component
 *
 * Chart is an organizer for D3's scales. Using the dimensions array it constructs a number of
 * scales, then it checks the children props and applies the scales accordingly.
 *
 * Each scale creates 3 dynamic props on both the Chart and each of it's children.
 *  * &lt;scaleName&gt;Dimension
 *  * &lt;scaleName&gt;ScaleType
 *  * &lt;scaleName&gt;Scale
 *
 *
 * @prop {string} <scaleName>Dimension
 * Picks the dimension of ChartData that this scale corresponds to.
 * e.g. `<Chart dimensions={['x', 'y', 'color']} xDimension="time" yDimension="distance" colorDimension="velocity" />`
 *
 * @prop {string} [<scaleName>ScaleType = scaleLinear]
 * Picks the starting D3 scale
 * e.g. `<Chart xScaleType="scalePoint" yScaleType="scaleLinear" />`
 *
 * @prop {function} [<scaleName>Scale]
 * Called with scale and props after the default scale has been constructed
 * e.g. `<Chart xScaleType={scale => scale.padding(.1)} />`
 *
 *
 * @example
 *
 * // Line chart
 * <Chart data={data} xDimension="time">
 *     <Line yDimension="distance"/>
 *     <Axis yDimension="distance" position="left" />
 *     <Axis xDimension="time" position="bottom" />
 * </Chart>
 *
 * // Column chart
 * <Chart data={data} xDimension="favoriteColor">
 *     <Column yDimension="people"/>
 * </Chart>
 *
 * // Point scale scatter plot
 * <Chart data={data} xDimension="favColor" xScaleType="scalePoint">
 *     <Line yDimension="distance"/>
 * </Chart>
 *
 * // Extended scale (column chart with extra padding)
 * <Chart data={data} xDimension="favoriteColor" xScale={scale => scale.padding(1)}>
 *     <Column yDimension="people"/>
 * </Chart>
 *
 * // Complete custom scale
 * var customScale = (scale, props) => {
 *     return scaleLog()
 *          .domain([props.data.min('distance'), pp.data.max('distance')])
 *          .range([0, props.height]);
 * }
 * <Chart data={data} xDimension="time" yScale={customScale}>
 *     <Line yDimension="distance"/>
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
                    const dimensionKey = `${dimensionName}Dimension`;
                    const scaleKey = `${dimensionName}Scale`;
                    const scaleTypeKey = `${dimensionName}ScaleType`;
                    const scaleGroupKey = `${dimensionName}ScaleGroup`;

                    return {
                        dimensionKey,
                        dimensionName,
                        scaleKey,
                        scaleTypeKey,
                        scaleGroupKey,
                        groups: canvas
                            .groupBy(ii => ii[scaleGroupKey] || dimensionName)
                            .map(gg => {
                                return gg
                                    .map(ii => List([].concat(ii[dimensionKey]).concat(props[dimensionKey])))
                                    .flatten(1)
                                    .toSet()
                                    .filter(ii => ii)
                                    .toArray();
                                }
                            )

                        // columns: getPropGroup(dimensionKey)
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
        const {dimensionName, scaleTypeKey, scaleGroupKey, dimensionKey, groups} = dimension;


        switch(dimensionName) {
            case 'x':
            case 'y':
                return (pp: Object): Function => {

                    // choose the max value of range based on x/width y/height
                    const bound = (dimensionName === 'x') ? pp.width : pp.height;
                    // Make the current dimension always a list
                    const currentDimension = List().concat(pp[dimensionKey]);
                    const columns = groups.get(pp[scaleGroupKey] || dimensionName)

                    // create a set of booleans to check if a group is mixing dimension types
                    function isContinuous(list: List): Set {
                        return list
                            .map(dd => pp.data.columns.getIn([dd, 'isContinuous']))
                            .toSet();
                    }

                    // if the size is greater than one we have multiple data types
                    if(isContinuous(List(columns)).size > 1) {
                        throw new Error(`${dimensionKey} cannot share continuous and non continuous data: ${groups.get(scaleGroupKey).join(', ')}`);
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
                            .domain(pp[dimensionKey] ? pp.data.getColumnData(currentDimension.get(0)).toArray() : [])
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
                const {scaleKey, dimensionKey} = dimension;
                const scale = this.getDefaultScale(dimension)(chartProps);
                const editScale = chartProps[scaleKey];

                return props
                    .set(scaleKey, typeof editScale === 'function' ? editScale(scale.copy(), chartProps) : scale)
                    .set(dimensionKey, chartProps[dimensionKey]);

            }, Map())
            .set('data', chartProps.data)
            .set('width', chartProps.width)
            .set('height', chartProps.height)
            .toObject();
    }
    render(): Element<any> {
        const {width, height, outerWidth, outerHeight, top, left} = this.getCanvasSize();

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
                return <Canvas x={x} y={y} height={axis.props.height} width={axis.props.width}>
                    {scaledChildren.getIn(['axis', key]).toArray()}
                </Canvas>;
            }
        }

        return <Canvas
            width={outerWidth}
            height={outerHeight}
        >
            {getAxis('top', left, 0)}
            {getAxis('right', left + width, top)}
            {getAxis('bottom', left, height + top)}
            {getAxis('left', 0, top)}
            <Canvas x={left} y={top} width={width} height={height}>
                {scaledChildren.get('canvas')}
            </Canvas>
        </Canvas>;
    }
}

export default Chart;
