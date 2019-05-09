// @flow
import type {Node} from 'react';
import type {LinePosition} from '../../definitions';
import type {TextPosition} from '../../definitions';
import type {Dimension} from '../../useScales';

import React from 'react';
import {max} from 'd3-array';
import ChartData from '../../chartdata/ChartData';

function DefaultAxisLine(props: {position: LinePosition}): Node {
    return <line
        stroke='#ccc'
        strokeWidth={1}
        {...props.position}
    />;
}

function DefaultTick(props: {position: LinePosition}): Node {
    return <line
        stroke='#ccc'
        {...props.position}
    />;
}

function DefaultText(props: {position: TextPosition}): Node {
    return <text
        fontSize={12}
        stroke="none"
        {...props.position}
    />;
}

type Position = 'top' | 'right' | 'bottom' | 'left';
type DimensionKey = 'x' | 'y';

type Props = {
    // required
    position: Position,
    dimension: DimensionKey,
    x: Dimension,
    y: Dimension,

    // default
    overlap: number,
    ticks: Function,
    textFormat: Function,
    axisLine: Function,
    axisLineWidth: number,
    text?: Function,
    textPadding: number,
    tickLine: Function,
    tickLineProps: *,
    tickSize: number,

    // optional
    location?: number | string | Date
};


export default class AxisRenderable extends React.PureComponent<Props> {

    static defaultProps = {
        axisLine: DefaultAxisLine,
        axisLineWidth: 1,
        overlap: 0,
        text: DefaultText,
        textFormat: (text: string | Date) => ChartData.isValueDate(text) && typeof text.toISOString === 'function'
            ? text.toISOString().slice(0,10)
            : text,
        textPadding: 6,
        tickLine: DefaultTick,
        ticks: (scale: {ticks: () => Array<mixed>, domain: () => Array<mixed>}) => scale.ticks ? scale.ticks() : scale.domain(),
        tickSize: 6
    };


    drawTicks(): Array<Node> {
        const {
            axisLineWidth,
            text: Text,
            tickLine: TickLine,
            tickSize,
            textPadding,
            position
        } = this.props;

        const {dimension} = this.props;
        const {textFormat} = this.props;
        const {x, y} = this.props;
        const {ticks} = this.props;
        const scale = dimension === 'x' ? x.scale : y.scale;

        const offset = scale.bandwidth ? scale.bandwidth() / 2 : 0;

        return ticks(scale)
            .map((tick: any, index: number): Node => {
                const distance = scale(tick) + offset;
                const formattedTick = textFormat(tick);

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
                    position: {x1, y1, x2, y2}
                };

                const textProps = {
                    index,
                    position: {
                        children: formattedTick,
                        x: textX,
                        y: textY,
                        textAnchor: this.getTextAnchorProp(position),
                        dominantBaseline: this.getAlignmentBaselineProp(position)
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
            position
        } = this.props;

        const [x1, y1] = this.getPointPosition(position, overlap * -1, 0);
        const [x2, y2] = this.getPointPosition(position, this.getLength(position) + overlap, 0);

        return <AxisLine position={{x1, y1, x2, y2}} />;
    }

    getAlignmentBaselineProp(position: Position): string {
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

    getTextAnchorProp(position: Position): string {
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

    getLength(position: Position): number {
        const {dimension} = this.props;
        return max(this.props[dimension].range);
    }

    getPointPosition(position: Position, distance: number, offset: number): Array<number> {
        let location = 0;
        const {x, y} = this.props;
        const width = max(x.range);
        const height = max(y.range);

        if(this.props.location != undefined) {
            if(position === 'top' || position === 'bottom') {
                location = x.scale(this.props.location);
            } else {
                location = y.scale(this.props.location);
            }
        }

        switch(position) {
            case 'top':
                return [distance, location - offset];
            case 'bottom':
                location = location || height;
                return [distance, location + offset];

            case 'left':
                return [location - offset, distance];
            case 'right':
                location = location || width;
                return [location + offset, distance];

            default:
                throw new Error(`unknown position: ${position}`);
        }
    }

    render(): Node {
        return <g>
            <g>{this.drawAxisLine()}</g>
            <g>{this.drawTicks()}</g>
        </g>;
    }
}


