// @flow

import PropTypes from 'prop-types';
import type {Node} from 'react';
import React from 'react';
import ChartData from '../../chartdata/ChartData';

function DefaultAxisLine(props: Object): Node {
    return <line
        stroke='inherit'
        {...props.axisLineProps}
    />;
}

function DefaultTick(props: Object): Node {
    return <line
        stroke='inherit'
        {...props.tickLineProps}
    />;
}

function DefaultText(props: Object): Node {
    return <text
        fontSize={12}
        children={props.tick}
        stroke="none"
        {...props.textProps}
    />;
}


export class AxisRenderable extends React.PureComponent<*> {

    static defaultProps = {
        axisLine: DefaultAxisLine,
        axisLineProps: {},
        axisLineWidth: 1,
        overlap: 0,
        text: DefaultText,
        textFormat: (text: string | Date) => ChartData.isValueDate(text) && typeof text.toISOString === 'function'
            ? text.toISOString().slice(0,10)
            : text,
        textPadding: 6,
        textProps: {},
        tickLine: DefaultTick,
        tickLineProps: {},
        ticks: (scale: {ticks: () => Array<mixed>, domain: () => Array<mixed>}) => scale.ticks ? scale.ticks() : scale.domain(),
        tickSize: 6
    };

    static propTypes = {
        position: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
        location: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
            PropTypes.instanceOf(Date)
        ]),
        axisLine: PropTypes.func,
        axisLineProps: PropTypes.object,
        axisLineWidth: PropTypes.number,
        tickLine: PropTypes.func,
        tickLineProps: PropTypes.object,
        text: PropTypes.func,
        textProps: PropTypes.object,
        textFormat: PropTypes.func,
        tickSize: PropTypes.number,
        textPadding: PropTypes.number,
        overlap: PropTypes.number,
        scale: PropTypes.func.isRequired,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        ticks: PropTypes.func,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    };

    drawTicks(): Array<Node> {
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
            .map((tick: any, index: number): Node => {
                const distance = scale(tick) + offset;
                const formattedTick = this.props.textFormat(tick);

                const [x1, y1] = this.getPointPosition(position, distance, axisLineWidth / 2);
                const [x2, y2] = this.getPointPosition(position, distance, axisLineWidth / 2 + tickSize);

                const [textX, textY] = this.getPointPosition(
                    position,
                    distance,
                    axisLineWidth / 2 + tickSize + textPadding
                );

                const tickLineProps = {
                    axisPosition: position,
                    index,
                    size: this.props.tickSize,
                    x: x1,
                    y: y1,
                    tickLineProps: {
                        x1,
                        y1,
                        x2,
                        y2,
                        strokeWidth: axisLineWidth,
                        ...this.props.tickLineProps
                    }
                };

                const textProps = {
                    index,
                    position,
                    tick: formattedTick,
                    x: textX,
                    y: textY,
                    textProps: {
                        x: textX,
                        y: textY,
                        textAnchor: this.getTextAnchorProp(position),
                        dominantBaseline: this.getAlignmentBaselineProp(position),
                        ...this.props.textProps
                    }
                };

                return <g key={tick}>
                    <TickLine {...tickLineProps} />
                    <Text {...textProps} />
                </g>;
            });
    }

    drawAxisLine(): Node {
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
            x: x1,
            y: y1,
            [this.getLengthProp(position)]: this.props[this.getLengthProp(position)],
            axisLineProps: {
                x1,
                y1,
                x2,
                y2,
                strokeWidth: axisLineWidth,
                ...this.props.axisLineProps
            }
        };

        return <AxisLine {...axisLineProps} />;
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
        var location = 0;
        var {yScale, xScale} = this.props;
        if(this.props.location != undefined) {
            if(position === 'top' || position === 'bottom') {
                location = yScale(this.props.location);
            } else {
                location = xScale(this.props.location);
            }
        }
        switch(position) {
            case 'top':
                return [distance, location - offset];
            case 'bottom':
                location = location || this.props.height;
                return [distance, location + offset];

            case 'left':
                return [location - offset, this.props.height - distance];
            case 'right':
                location = location || this.props.width;
                return [location + offset, this.props.height - distance];

            default:
                throw new Error(`unknown position: ${position}`);
        }
    }

    render(): Node {
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


export default class Axis extends React.Component<*> {
    static chartType = 'axis';
    static propTypes = {
        dimension: PropTypes.string.isRequired,
        position: PropTypes.oneOf(['top', 'right', 'bottom', 'left'])
    }
    render(): Node {
        const {dimension, position} = this.props;
        const defaultPosition = (dimension === 'x') ? 'bottom' : 'left';

        return <AxisRenderable
            {...this.props}
            position={position || defaultPosition}
            scale={this.props[`${dimension}Scale`]}
        />;
    }
}
