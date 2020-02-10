// @flow
import type {BaseScale} from './baseScale';
import type Series from '../series/Series';

import * as d3Scale from 'd3-scale';
import categoricalScale from './categoricalScale';
import continuousScale from './continuousScale';
import baseScale from './baseScale';


type ColorScaleConfig = {
    series: Series,
    key: string,
    interpolate?: Function,
    range?: [number, number]
};

export type ColorScale = BaseScale & {
    type: 'color',
    scale: Function
};


export default function colorScale(config: ColorScaleConfig): ColorScale {
    const {interpolate, range, key, series} = config;
    let scale;

    if(interpolate) {
        const baseScale = continuousScale({key, series, range}).scale;
        scale = d3Scale.scaleSequential(interpolate).domain(baseScale.domain());
    } else {
        const baseScale = categoricalScale({key, series}).scale;
        scale = baseScale.range(range || baseScale.domain());
    }

    return baseScale({
        ...config,
        type: 'color',
        scale
    });

}
