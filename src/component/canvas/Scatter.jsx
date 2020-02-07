// @flow
import type {Node} from 'react';
import type {ContinuousScale} from '../../scale/continuousScale';

import React from 'react';
import mapSeries from '../../util/mapSeries';



const isNumber = (value) => typeof value === 'number' && !isNaN(value);

type Props = {
    stroke?: string,
    strokeWidth?: string,
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
        {series.groups.map((group, groupIndex) => {
            return group.map((point, pointIndex) => {
                const cx = x.scalePoint(point);
                const cy = y.scalePoint(point);
                const r = radius.scalePoint(point);
                const fill = color.scalePoint(point);

                if(!isNumber(cx) || !isNumber(cy) || !isNumber(r)) return null;
                return <circle
                    key={`${groupIndex}-${pointIndex}`}
                    fill={fill || '#000'}
                    stroke={props.stroke}
                    strokeWidth={props.strokeWidth}
                    r={r}
                    cx={cx}
                    cy={cy}
                />;
            });
        })}
    </g>;
}

