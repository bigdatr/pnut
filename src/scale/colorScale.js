// @flow
import * as d3Scale from 'd3-scale';
import * as d3Interpolate from 'd3-interpolate';

import categoricalScale from './categoricalScale';
import continuousScale from './continuousScale';


type ScaleConfig<Data> = {
    column: string,
    data: Data,
    zero?: boolean,
    updateScale?: Scale => Scale,
    range: [number, number]
};

export type ColorScale = {
    type: 'continuous',
    scale: Function,
    range: [number, number],
    zero: boolean,
    isNumber: boolean,
    isTime: boolean,
    column: string
};


export default function colorScale<Data: Data[]>(config: ScaleConfig<Data>): Function {
    const {interpolate, range, column} = config;
    let scale;

    if(interpolate) {
        const baseScale = continuousScale(config).scale;
        scale = d3Scale.scaleSequential(interpolate).domain(baseScale.domain());
    } else {
        const baseScale = categoricalScale(config).scale;
        scale = baseScale.range(range);
    }

    const get = (row) => row[column];


    return {
        type: 'color',
        get,
        scale,
        scaleRow: (row) => scale(get(row))
    };

}
