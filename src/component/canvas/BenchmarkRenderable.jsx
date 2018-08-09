// @flow

import React from 'react';

function DefaultLine(props: Object): React.Element<any> {
    return <line
        stroke='inherit'
        {...props.lineProps}
    />;
}

function DefaultText(props: Object): React.Element<any> {
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
 * Benchmark renders a straight line on an x|y axis with a label
 *
 * @example
 *
 * <BenchmarkRenderable
 *     dimension="x"
 *     location={20}
 *     label="Foo"
 * />
 *
 */
export class BenchmarkRenderable extends React.PureComponent {

    static defaultProps = {
        textPosition: 'top',
        dimension: 'y',
        line: DefaultLine,
        lineProps: {},
        labelOffset: [0, 0],
        text: DefaultText,
        textProps: {}
    };

    static propTypes = {
        /** {'top'|'right'|'bottom'|'left'} The position of the label */
        textPosition: React.PropTypes.oneOf(['top', 'bottom']),

        /** {'x'|'y'} The scale to base the benchmark on */
        dimension: React.PropTypes.oneOf(['x', 'y']),

        /** Domain value of opposite scale at which to render the axis */
        location: React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string,
            React.PropTypes.instanceOf(Date)
        ]).isRequired,

        /** Label next to the line */
        label: React.PropTypes.string,

        /** xy tuple to reposition the label away from the line */
        labelOffset: React.PropTypes.arrayOf(React.PropTypes.number),

        /** Custom line renderer */
        line: React.PropTypes.func,

        /** {Object} An object of props that are passed to the axis line - the line that sits against the chart edge. */
        lineProps: React.PropTypes.object,


        /** Custom text renderer */
        text: React.PropTypes.func,

        /** {Object} An object of props that are passed to the each text node */
        textProps: React.PropTypes.object,

        /** {Scale} The [d3-scale](https://github.com/d3/d3-scale) for the axis */
        xScale: React.PropTypes.func,

        /** {Scale} The [d3-scale](https://github.com/d3/d3-scale) for the axis */
        yScale: React.PropTypes.func,

        /** The width of the axis */
        width: React.PropTypes.number.isRequired,

        /** The height of the axis */
        height: React.PropTypes.number.isRequired
    };

    //
    // Text

    drawText(): React.Element<any> {
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
        const scale = this.props[`${dimension}Scale`];
        const value = scale(location);
        const {height} = this.props;
        const {width} = this.props;

        if(dimension === 'x') {
            return [value, 0, value, height];
        } else {
            return [0, height - value, width, height - value];
        }
    }

    drawLine(): React.Element<any> {
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


    render(): React.Element<any> {
        return <g>
            {this.props.label && this.drawText()}
            {this.drawLine()}
        </g>;
    }
}


export default class Benchmark extends React.Component {
    render(): React.Element<any> {
        return <BenchmarkRenderable {...this.props} />;
    }
}
