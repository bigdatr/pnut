// @flow

import React from 'react';

function DefaultAxisLine(props: Object): React.Element<any> {
    return <line
        stroke='black'
        {...props.axisLineProps}
    />;
}

function DefaultTick(props: Object): React.Element<any> {
    return <line
        stroke='black'
        {...props.tickLineProps}
    />;
}

function DefaultText(props: Object): React.Element<any> {
    return <text
        fontSize={12}
        children={props.tick}
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
        axisLine: DefaultAxisLine,
        axisLineProps: {},
        axisLineWidth: 1,
        overlap: 0,
        text: DefaultText,
        textFormat: (text) => text,
        textPadding: 6,
        textProps: {},
        tickLine: DefaultTick,
        tickLineProps: {},
        ticks: (scale) => scale.ticks ? scale.ticks() : scale.domain(),
        tickSize: 6
    };

    static propTypes = {
        /** {'top'|'right'|'bottom'|'left'} The position of the axis */
        position: React.PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,

        /** Custom axisLine renderer */
        axisLine: React.PropTypes.func,

        /** {Object} An object of props that are passed to the axis line - the line that sits against the chart edge. */
        axisLineProps: React.PropTypes.object,

        axisLineWidth: React.PropTypes.number,

        /** Custom tickLine renderer */
        tickLine: React.PropTypes.func,

        /** {Object} An object of props that are passed to the each tick */
        tickLineProps: React.PropTypes.object,

        /** Custom text renderer */
        text: React.PropTypes.func,

        /** {Object} An object of props that are passed to the each text node */
        textProps: React.PropTypes.object,

        /**
         * {Function} a function that is called for each tick and is passed the tick value. This can
         * be used for example to add a percent symbol to the tick: `(value) => value + '%'`
         */
        textFormat: React.PropTypes.func,

        /** The length of the tick line. */
        tickSize: React.PropTypes.number,

        /** The padding between a tick line and the tick text */
        textPadding: React.PropTypes.number,

        /**
         * The distance the axis line should extend past its bounds. This can be used to make two
         * perpendicular axis lines overlap where they meet.
         */
        overlap: React.PropTypes.number,

        /** {Scale} The [d3-scale](https://github.com/d3/d3-scale) for the axis */
        scale: React.PropTypes.func.isRequired,

        /**
         * An array of ticks to display on the axis. In most cases this can be constructed by
         * calling the scale's [`ticks`](https://github.com/d3/d3-scale#continuous_ticks) function.
         */
        ticks: React.PropTypes.func,

        /** The width of the axis */
        width: React.PropTypes.number.isRequired,

        /** The height of the axis */
        height: React.PropTypes.number.isRequired
    };

    drawTicks(): Array<React.Element<any>> {
        const {
            axisLineWidth,
            text: Text,
            tickLine: TickLine,
            tickSize,
            textPadding,
            scale,
            position
        } = this.props;

        const offset = this.props.scale.bandwidth ? this.props.scale.bandwidth() / 2 : 0;

        return this.props
            .ticks(scale)
            .map((tick: any): React.Element<any> => {
                const distance = scale(tick) + offset;

                const [x1, y1] = this.getPointPosition(position, distance, axisLineWidth / 2);
                const [x2, y2] = this.getPointPosition(position, distance, axisLineWidth / 2 + tickSize);

                const [textX, textY] = this.getPointPosition(
                    position,
                    distance,
                    axisLineWidth / 2 + tickSize + textPadding
                );

                const tickLineProps = {
                    x1,
                    y1,
                    x2,
                    y2,
                    axisLineWidth,
                    ...this.props.tickLineProps
                };

                const textProps = {
                    x: textX,
                    y: textY,
                    textAnchor: this.getTextAnchorProp(position),
                    dominantBaseline: this.getAlignmentBaselineProp(position),
                    ...this.props.textProps
                };

                return <g key={tick}>
                    <TickLine tickLineProps={tickLineProps} />
                    <Text tick={this.props.textFormat(tick)} textProps={textProps} />
                </g>;
            });
    }

    drawAxisLine(): React.Element<any> {
        const {
            axisLine: AxisLine,
            overlap,
            position,
            axisLineWidth
        } = this.props;

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

        const axisLineProps = {
            x1,
            y1,
            x2,
            y2,
            strokeWidth: axisLineWidth,
            ...this.props.axisLineProps
        };

        return <AxisLine
            axisLineProps={axisLineProps}
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
                {this.drawAxisLine()}
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
