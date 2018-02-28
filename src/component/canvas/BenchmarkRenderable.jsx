// @flow
import React from 'react';
import type {Node} from 'react';
import PropTypes from 'prop-types';


function DefaultLine(props: Object): Node {
    return <line
        stroke='inherit'
        {...props.lineProps}
    />;
}

function DefaultText(props: Object): Node {
    return <text
        fontSize={12}
        children={props.children}
        stroke="none"
        {...props.textProps}
    />;
}


/**
 *
 * @component
 *
 * Axis renders the top, bottom, left, or right axis for a chart.
 *
 * @example
 *
 * <BenchmarkRenderable
 *     width={this.props.eqWidth - 100}
 *     height={50}
 *     position='bottom'
 *     ticks={['category1', 'category2', 'category3']}
 *     scale={scaleX}
 * />
 *
 */
export class BenchmarkRenderable extends React.PureComponent<Object> {

    static defaultProps = {
        textPosition: 'top',
        dimension: 'y',
        line: DefaultLine,
        lineProps: {},
        text: DefaultText,
        textProps: {}
    };

    static propTypes = {
        /** {'top'|'right'|'bottom'|'left'} The position of the label */
        textPosition: PropTypes.oneOf(['top', 'bottom']),

        /** {'x'|'y'} The scale to base the benchmark on */
        dimension: PropTypes.oneOf(['x', 'y']),

        /** Domain value of opposite scale at which to render the axis */
        location: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
            PropTypes.instanceOf(Date)
        ]).isRequired,

        /** Custom line renderer */
        line: PropTypes.func,

        label: PropTypes.string,
        labelOffset: PropTypes.number,

        /** {Object} An object of props that are passed to the axis line - the line that sits against the chart edge. */
        lineProps: PropTypes.object,

        /** Custom text renderer */
        text: PropTypes.func,

        /** {Object} An object of props that are passed to the each text node */
        textProps: PropTypes.object,

        /** {Scale} The [d3-scale](https://github.com/d3/d3-scale) for the axis */
        xScale: PropTypes.func,

        /** {Scale} The [d3-scale](https://github.com/d3/d3-scale) for the axis */
        yScale: PropTypes.func,

        /** The width of the axis */
        width: PropTypes.number.isRequired,

        /** The height of the axis */
        height: PropTypes.number.isRequired
    };

    //
    // Text

    drawText(): Node {
        const {
            text: Text,
            location,
            label,
            dimension,
            labelOffset
        } = this.props;

        const [offsetX, offsetY] = labelOffset;

        const [x, y] = this.getPointPosition(
            dimension,
            location
        );

        const textProps = {
            x: x + offsetX,
            y: y + offsetY,
            textProps: {
                x: x + offsetX,
                y: y + offsetY,
                transform: dimension === 'x' ? `rotate(90, ${x}, ${y})` : null,
                ...this.props.textProps
            }
        };

        return <Text {...textProps}>{label}</Text>;
    }


    //
    // Line

    getLengthProp(dimension: 'x'|'y'): string {
        return dimension === 'y' ? 'width' : 'height';
    }

    getPointPosition(dimension: 'x'|'y', location: *): Array<number> {
        console.log(dimension);
        const scale = this.props[`${dimension}Scale`];
        const value = scale(location);

        if(dimension === 'x') {
            return [value, 0, value, this.props.height];
        } else {
            return [0, value, this.props.width, value];
        }
    }

    drawLine(): Node {
        const {
            line: Line,
            location,
            dimension
        } = this.props;


        const [x1, y1, x2, y2] = this.getPointPosition(dimension, location);

        const lineProps = {
            x: x1,
            y: y1,
            lineProps: {
                x1,
                y1,
                x2,
                y2,
                ...this.props.lineProps
            }
        };

        return <Line {...lineProps} />;
    }


    render(): Node {
        return <g>
            {this.props.label && this.drawText()}
            {this.drawLine()}
        </g>;
    }
}


export default class Benchmark extends React.Component<Object> {
    render(): Node {
        return <BenchmarkRenderable {...this.props} />;
    }
}
