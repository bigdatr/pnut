// @flow
import type {Node} from 'react';
import type {Dimension} from '../../useScales';
import type {ComponentType} from 'react';
import type {Scale} from '../../definitions';

import React from 'react';



const ticks = (scale) => scale.ticks ? scale.ticks() : scale.domain();

type Props = {
    x: Dimension,
    xLine?: ComponentType<*>,
    xTicks?: (scale: Scale) => Array<*>,
    y: Dimension,
    yLine?: ComponentType<*>,
    yTicks?: (scale: Scale) => Array<*>
};

export default function Gridlines(props: Props) {
    const {y} = props;
    const {x} = props;
    const {xTicks = ticks} = props;
    const {yTicks = ticks} = props;
    const {xLine: LineVertical = DefaultGridline} = props;
    const {yLine: LineHorizontal = DefaultGridline} = props;

    return <g>
        {xTicks(x.scale).map((tick) => {
            const value = x.scale(tick);
            const [y1, y2] = y.range;
            return <LineVertical
                position={{x1: value, x2: value, y1, y2}}
            />;
        })}
        {yTicks(y.scale).map((tick) => {
            const value = y.scale(tick);
            const [x1, x2] = x.range;
            return <LineHorizontal
                position={{x1, x2, y1: value, y2: value}}
            />;
        })}
    </g>;
}


type GridlineProps = {
    position: {x1: number, x2: number, y1: number, y2: number}
};

function DefaultGridline(props: GridlineProps): Node {
    return <line stroke='black' {...props.position}/>;
}
