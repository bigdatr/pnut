// @flow
import React, {Component, Children, cloneElement, Element, PropTypes} from 'react';
import {List, Map} from 'immutable';
import Canvas from './canvas/Canvas';
import * as d3Scale from 'd3-scale';

class Chart extends Component {
    state: Object;
    getChildProps: Function;
    getCanvasSize: Function;
    getAxisSize: Function;

    static propTypes = {
        dimensions: PropTypes.array,
        height: PropTypes.number,
        padding: PropTypes.array,
        width: PropTypes.number
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

        const childrenGroups = List(childrenProps)
            .groupBy(ii => ii.chartType);

        this.state = {
            dimensions: props.dimensions
                .map((dimensionName: string): Object => {
                    const dimensionKey = `${dimensionName}Dimension`;
                    const scaleKey = `${dimensionName}Scale`;
                    const scaleTypeKey = `${dimensionName}ScaleType`;

                    return {
                        dimensionKey,
                        dimensionName,
                        scaleKey,
                        scaleTypeKey,
                        dimensions: childrenGroups
                            .get('canvas')
                            .map(ii => ii[dimensionKey] || props[dimensionKey])
                            .toSet()
                            .toArray()
                    };
                })
        };

        this.getChildProps = this.getChildProps.bind(this);
        this.getCanvasSize = this.getCanvasSize.bind(this);
        this.getAxisSize = this.getAxisSize.bind(this);
    }
    getCanvasSize(): Object {
        const {width = 0, height = 0, padding = []} = this.props;
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
    getAxisSize(axisType): Object {
        const {top, right, bottom, left, width, height} = this.getCanvasSize();
        switch(axisType) {
            case 'top':
                return {
                    width,
                    height: top
                }
            case 'right':
                return {
                    width: right,
                    height
                }

            case 'bottom':
                return {
                    width,
                    height: bottom
                }

            case 'left':
                return {
                    width: left,
                    height
                }

        }
    }
    getDefaultScale(dimension: Object): Function {
        const {dimensionName, scaleTypeKey, dimensionKey, dimensions} = dimension;
        switch(dimensionName) {
            case 'x':
                return pp => {
                    return d3Scale[pp[scaleTypeKey] || 'scaleLinear']()
                        .domain(pp.data.rows.map(row => row.get(pp[dimensionKey])).toArray())
                        .range([0, pp.width]);
                };

            case 'y':
                return pp => {

                    return d3Scale[pp[scaleTypeKey] || 'scaleLinear']()
                        .domain([pp.data.min(dimensions), pp.data.max(dimensions)])
                        .range([0, pp.height]);
                };

            default:
                return pp => {
                    return d3Scale[pp[scaleTypeKey] || 'scaleLinear']()
                };
        }
    }
    getChildProps(type, props) {
        const {dimensions} = this.state;
        const chartProps = Object.assign({}, this.state, this.props, this.getCanvasSize(), props);

        return List(dimensions)
            .reduce((props, dimension) => {
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
        const {width, height, outerWidth, outerHeight, top, left, right, bottom} = this.getCanvasSize();

        if(!width || !height) {
            return <div/>;
        }

        const scaledChildren = List(Children.toArray(this.props.children))
            .map(child => {
                const {chartType} = child.type;
                switch(chartType) {
                    case 'canvas':
                        return cloneElement(child, this.getChildProps(chartType, child.props));

                    case 'axis':
                        return cloneElement(child, {
                            ...this.getChildProps(chartType, child.props),
                            ...this.getAxisSize(child.props.position)
                        });
                }
            })
            .groupBy(child => child.type.chartType || 'canvas')
            .updateIn(['axis'], ii => ii.groupBy(aa => aa.props.position));


        const svgStyle = {
            display: 'block',
            overflow: 'visible'
        }

        function getAxis(key: string, x: number, y: number): ?Element<any> {
            const axis = scaledChildren.getIn(['axis', key, 0]);
            if(axis) {
                return <svg {...svgStyle} name={key} x={x} y={y} height={axis.props.height} width={axis.props.width}>
                    {scaledChildren.getIn(['axis', key]).toArray()}
                </svg>
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
            // <g transform={`translate(${left}, ${top})`} width={innerWidth} height={innerHeight}>
            // </g>
}



// const withEq = ElementQueryHock([]);


export default Chart;
