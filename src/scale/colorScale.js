// @flow
import * as d3Scale from 'd3-scale';

import categoricalScale from './categoricalScale';
import continuousScale from './continuousScale';


type ScaleConfig<Data> = {
    key: string,
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
    point: string
};


export default function colorScale<Data: Data[]>(config: ScaleConfig<Data>): Function {
    const {interpolate, range, key} = config;
    let scale;

    if(interpolate) {
        const baseScale = continuousScale(config).scale;
        scale = d3Scale.scaleSequential(interpolate).domain(baseScale.domain());
    } else {
        const baseScale = categoricalScale(config).scale;
        scale = baseScale.range(range || baseScale.domain());
    }

    const get = (group) => group[key];


    return {
        type: 'color',
        get,
        scale,
        scalePoint: (group) => scale(get(group))
    };

}
