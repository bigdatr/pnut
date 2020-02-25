// @flow
import type {Node} from 'react';
import type {ComponentType} from 'react';
import type {LinePosition} from '../../definitions';
import type {TextPosition} from '../../definitions';
import type Series from '../../series/Series';
import type {ContinuousScale} from '../../scale/continuousScale';
import type {CategoricalScale} from '../../scale/categoricalScale';

import React from 'react';
import {max} from 'd3-array';

function DefaultAxisLine(props: {position: LinePosition}): Node {
    return <line
        {...props.position}
        stroke='currentColor'
        strokeWidth={1}
    />;
}

function DefaultTick(props: {position: LinePosition}): Node {
    return <line
        {...props.position}
        stroke='black'
    />;
}

function DefaultText(props: {position: TextPosition}): Node {
    return <text
        {...props.position}
        fontSize={10}
        stroke="none"
    />;
}

type Position = 'top' | 'right' | 'bottom' | 'left';
type DimensionKey = 'x' | 'y';

type Props = {
    // required
    position: Position,
    scales: {
        series: Series,
        x: ContinuousScale|CategoricalScale,
        y: ContinuousScale|CategoricalScale
    },

    // default
    overlap: number,
    ticks: Function,
    textFormat: Function,
    axisLine: ComponentType<*>,
    axisLineWidth: number,
    text: ComponentType<*>,
    textPadding: number,
    tickLine: ComponentType<*>,
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
        textFormat: (text: mixed) => text,
        textPadding: 6,
        tickLine: DefaultTick,
        ticks: (scale: {ticks: () => Array<mixed>, domain: () => Array<mixed>}) => scale.ticks ? scale.ticks() : scale.domain(),
        tickSize: 6
    };

    dimension(): DimensionKey {
        const {position} = this.props;
        return (position === 'top' || position === 'bottom') ? 'x' : 'y';
    }

    drawTicks(): Array<Node> {
        const {
            axisLineWidth,
            text: Text,
            tickLine: TickLine,
            tickSize,
            textPadding,
            position
        } = this.props;

        const dimension = this.dimension();
        const {textFormat} = this.props;
        const {x, y} = this.props.scales;
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
        const [x2, y2] = this.getPointPosition(position, this.getLength() + overlap, 0);

        return <AxisLine position={{x1, y1, x2, y2}} />;
    }

    getAlignmentBaselineProp(position: Position): string {
        if(position === 'left' || position === 'right') return 'middle';
        if(position === 'top') return 'auto';
        return 'hanging';
    }

    getTextAnchorProp(position: Position): string {
        switch(position) {
            case 'top':
            case 'bottom':
                return 'middle';
            case 'left':
                return 'end';
            case 'right':
            default:
                return 'start';
        }
    }

    getLength(): number {
        return max(this.props.scales[this.dimension()].range);
    }

    getPointPosition(position: Position, distance: number, offset: number): Array<number> {
        let locationValue = 0;
        let {location} = this.props;
        const {x, y} = this.props.scales;
        const dimension = this.dimension();
        const width = max(x.range);
        const height = max(y.range);

        if(this.props.location != undefined) {
            if(dimension === 'y') {
                locationValue = x.scale(this.props.location);
            } else {
                locationValue = y.scale(this.props.location);
            }
        }

        switch(position) {
            case 'top':
                return [distance, locationValue - offset];

            case 'bottom':
                locationValue = location != null ? locationValue : height;
                return [distance, locationValue + offset];

            case 'left':
                return [locationValue - offset, distance];

            case 'right':
                locationValue = location != null ? locationValue : width;
                return [locationValue + offset, distance];

            default:
                throw new Error(`unknown position: ${position}`);
        }
    }

    render(): Node {
        return <g shapeRendering="crispedges">
            <g>{this.drawAxisLine()}</g>
            <g>{this.drawTicks()}</g>
        </g>;
    }
}


