// @flow
import type {Node} from 'react';
import type {Dimension} from '../../useScales';
import type {ComponentType} from 'react';

import React from 'react';



const defaultDot = (props: Object): Node => {
    return <circle fill='black' r={3} {...props.position}/>;
};

const isNumber = (value) => typeof value === 'number' && !isNaN(value);

type Props = {
    x: Dimension,
    y: Dimension,
    color: Array<string>,
    Dot?: ComponentType<*>
};

export default function Scatter(props: Props) {
    const {y} = props;
    const {x} = props;
    const {color} = props;
    const {Dot = defaultDot} = props;


    return <g>
        {y.scaledData.map((series, seriesIndex) => series.map((row, index) => {
            const xValue = x.scaledData[0][index][0];
            const yValue = y.stack ? row[1] : row[0];

            if(!isNumber(yValue) || !isNumber(xValue)) return null;
            return <Dot
                key={`${seriesIndex}.${index}`}
                color={color[seriesIndex]}
                position={{
                    cx: x.scaledData[0][index],
                    cy: yValue
                }}
            />;
        }))}
    </g>;
}

