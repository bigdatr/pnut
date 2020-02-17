// @flow
import type {BaseScale} from './baseScale';
import type Series from '../series/Series';

import * as d3Scale from 'd3-scale';
import {piecewise, interpolateRgb} from 'd3-interpolate';
import categoricalScale from './categoricalScale';
import continuousScale from './continuousScale';
import baseScale from './baseScale';


type ColorScaleConfig = {
    series: Series,
    key: string,
    interpolate?: Function,
    range?: Array<string>,
    set?: Array<string>
};

export type ColorScale = BaseScale & {
    type: 'color',
    scale: Function
};


export default function colorScale(config: ColorScaleConfig): ColorScale {
    const {interpolate, range, key, series, set} = config;
    let scale;

    if(interpolate) {
        const baseScale = continuousScale({key, series}).scale;
        scale = d3Scale
            .scaleSequential()
            .interpolator(interpolate)
            .domain(baseScale.domain());
    }
    else if (set) {
        const baseScale = categoricalScale({key, series}).scale;
        scale = baseScale.range(set);
    }
    else if (range) {
        const baseScale = continuousScale({key, series}).scale;
        scale = d3Scale
            .scaleSequential()
            .interpolator(piecewise(interpolateRgb.gamma(2.2), range))
            .domain(baseScale.domain());
    }
    else {
        scale = point => point;
    }

    return baseScale({
        ...config,
        type: 'color',
        scale
    });

}
