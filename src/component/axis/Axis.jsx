// @flow

import React from 'react';

/**
 *
 * @component
 *
 * Axis renders the top, bottom, left, or right axis for a chart.
 *
 * @example
 *
 * <AxisRenderable
 *     width={this.props.eqWidth - 100}
 *     height={50}
 *     position='bottom'
 *     ticks={['category1', 'category2', 'category3']}
 *     scale={scaleX}
 * />
 *
 */
export class AxisRenderable extends React.PureComponent {

    static defaultProps = {
        lineProps: {},
        tickProps: {},
        textProps: {},
        textFormat: (text) => text,
        ticks: (scale) => scale.ticks ? scale.ticks() : scale.domain(),
        tickSize: 6,
        textPadding: 6,
        overlap: 0
    };

    static propTypes = {
        /**
         * {'top'|'right'|'bottom'|'left'} The position of the axis
         */
        position: React.PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,

        /**
         * {Object} An object of props that are passed to the axis line - the line that sits
         * against the chart edge.
         */
        lineProps: React.PropTypes.object,


        /**
         * @typedef TickPropsFunction
         * @callback
         *
         * @param {*} tick - The value for this tick
         * @param {number} index - This tick's index in the ticks array
         * @param {number} x - The calculated x position for this tick
         * @param {number} y - The calculated y position for this tick
         * @param {Scale} scale - The scale for this axis
         */

        /**
         * {Object|TickPropsFunction} Either an object of props or a function that returns an object of props
         * to be spread onto the `<line/>` element that is used to draw the tick. This can be used
         * to customise the look of the ticks.
         */
        tickProps: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.func
        ]),

        /**
         * @typedef TextPropsFunction
         * @callback
         *
         * @param {*} tick - The value for this tick
         * @param {number} index - This tick's index in the ticks array
         * @param {number} x - The calculated x position for the text displaying the tick's value
         * @param {number} y - The calculated y position for the text displaying the tick's value
         * @param {Scale} scale - The scale for this axis
         */

        /**
         * {Object|TextPropsFunction} Either an object of props or a function that returns an object of props
         * to be spread onto the `<text/>` element that is used to draw the text relating to this
         * tick. This can be used to customise the look of the tick's text. To customise the text
         * string see `textFormat`
         */
        textProps: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.func
        ]),

        /**
         * {Function} a function that is called for each tick and is passed the tick value. This can
         * be used for example to add a percent symbol to the tick: `(value) => value + '%'`
         */
        textFormat: React.PropTypes.func,

        /**
         * The length of the tick line.
         */
        tickSize: React.PropTypes.number,

        /**
         * The padding between a tick line and the tick text
         */
        textPadding: React.PropTypes.number,

        /**
         * The distance the axis line should extend past its bounds. This can be used to make two
         * perpendicular axis lines overlap where they meet.
         */
        overlap: React.PropTypes.number,

        /**
         * {Scale} The [d3-scale](https://github.com/d3/d3-scale) for the axis
         */
        scale: React.PropTypes.func.isRequired,

        /**
         * An array of ticks to display on the axis. In most cases this can be constructed by
         * calling the scale's [`ticks`](https://github.com/d3/d3-scale#continuous_ticks) function.
         */
        ticks: React.PropTypes.func,

        /**
         * The width of the axis
         */
        width: React.PropTypes.number.isRequired,

        /**
         * The height of the axis
         */
        height: React.PropTypes.number.isRequired
    };

    defaultLineWidth = 1;


    drawTicks(): Array<React.Element<any>> {
        const axisPosition = this.props.position;
        const tickSize = this.props.tickSize;
        const strokeWidth = this.props.lineProps.strokeWidth || this.defaultLineWidth;
        const offset = this.props.scale.bandwidth ? this.props.scale.bandwidth() / 2 : 0;

        return this.props.ticks(this.props.scale).map((tick: any, index: number): React.Element<any> => {
            const distance = this.props.scale(tick) + offset;

            const [x1, y1] = this.getPointPosition(axisPosition, distance, strokeWidth / 2);
            const [x2, y2] = this.getPointPosition(axisPosition, distance, strokeWidth / 2 + tickSize);

            const [textX, textY] = this.getPointPosition(
                axisPosition,
                distance,
                strokeWidth / 2 + tickSize + this.props.textPadding
            );

            return <g
                key={tick}
            >
                <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke='black'
                    strokeWidth={1}
                    {...(
                        typeof this.props.tickProps === 'function'
                            ? this.props.tickProps(tick, index, x1, y1, this.props.scale)
                            : this.props.tickProps
                    )}
                />

                <text
                    x={textX}
                    y={textY}
                    textAnchor={this.getTextAnchorProp(axisPosition)}
                    dominantBaseline={this.getAlignmentBaselineProp(axisPosition)}
                    fontSize={12}
                    {...(
                        typeof this.props.textProps === 'function'
                            ? this.props.textProps(tick, index, textX, textY, this.props.scale)
                            : this.props.textProps
                    )}
                >
                    {this.props.textFormat(tick)}
                </text>
            </g>;
        });
    }

    drawAxis(): React.Element<any> {
        const position = this.props.position;
        const strokeWidth = this.props.lineProps.strokeWidth || this.defaultLineWidth;
        const overlap = this.props.overlap;

        const [x1, y1] = this.getPointPosition(
            position,
            overlap * -1,
            0
        );

        const [x2, y2] = this.getPointPosition(
            position,
            this.props[this.getLengthProp(position)] + overlap,
            0
        );

        return <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke='black'
            strokeWidth={strokeWidth}
            {...this.props.lineProps}
        />;
    }

    getAlignmentBaselineProp(position: 'top'|'right'|'bottom'|'left'): string {
        switch(position) {
            case 'left':
            case 'right':
                return 'middle';
            case 'top':
                return 'auto';
            case 'bottom':
                return 'hanging';
            default:
                throw new Error(`unknown position: ${position}`);
        }
    }

    getTextAnchorProp(position: 'top'|'right'|'bottom'|'left'): string {
        switch(position) {
            case 'top':
            case 'bottom':
                return 'middle';
            case 'left':
                return 'end';
            case 'right':
                return 'start';
            default:
                throw new Error(`unknown position: ${position}`);
        }
    }

    getLengthProp(position: 'top'|'right'|'bottom'|'left'): string {
        return position === 'top' || position === 'bottom' ? 'width' : 'height';
    }

    getPointPosition(
        position: 'top'|'right'|'bottom'|'left',
        distance: number,
        offset: number
    ): Array<number> {
        switch(position) {
            case 'top':
                return [distance, this.props.height - offset];
            case 'right':
                return [offset, this.props.height - distance];
            case 'bottom':
                return [distance, offset];
            case 'left':
                return [this.props.width - offset, this.props.height - distance];
            default:
                throw new Error(`unknown position: ${position}`);
        }
    }

    render(): React.Element<any> {
        return <g>
            <g>
                {this.drawAxis()}
            </g>
            <g>
                {this.drawTicks()}
            </g>
        </g>;
    }
}


export default class Axis extends React.Component {
    static chartType = 'axis';
    static propTypes = {
        /**
         * The dimension to base this axis off. Probably x or y
         */
        dimension: React.PropTypes.string.isRequired
    }
    render(): React.Element<any> {
        return <AxisRenderable {...this.props} scale={this.props[`${this.props.dimension}Scale`]}/>;
    }
}
