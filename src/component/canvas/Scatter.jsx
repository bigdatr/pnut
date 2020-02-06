// @flow
import type {Node} from 'react';
import type {ContinuousScale} from '../../scale/continuousScale';

import React from 'react';
import mapSeries from '../../util/mapSeries';



const isNumber = (value) => typeof value === 'number' && !isNaN(value);

type Props = {
    scales: {
        x: ContinuousScale,
        y: ContinuousScale,
        radius: ContinuousScale,
        color: CategoricalScale,
        series: GroupSeries|SingleSeries
    }
};


export default function Scatter(props: Props): Node {
    const {x, y, radius, color, series} = props.scales;

    return <g className="Scatter">
        {mapSeries(series, (item, key) => {
            const cx = x.scale(x.get(item));
            const cy = y.scale(y.get(item));
            const r = radius.scale(radius.get(item));
            const fill = color.scale(color.get(item));

            if(!isNumber(cx) || !isNumber(cy) || !isNumber(r)) return null;
            return <circle
                key={key}
                fill={fill || '#000'}
                stroke={props.stroke}
                strokeWidth={props.strokeWidth}
                r={r}
                cx={cx}
                cy={cy}
            />;
        })}
    </g>;
}

