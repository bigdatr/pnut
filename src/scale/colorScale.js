// @flow
import type Series from '../series/Series';

import * as d3Scale from 'd3-scale';
import {piecewise, interpolateRgb} from 'd3-interpolate';
import CategoricalScale from './categoricalScale';
import ContinuousScale from './continuousScale';
import Scale from './baseScale';


type ColorScaleConfig = {
    series: Series,
    key: string,
    interpolate?: Function,
    range?: Array<string>,
    set?: Array<string>
};

export default class ColorScale extends Scale {
    constructor(config: ColorScaleConfig) {
        const {interpolate, range, key, series, set} = config;
        let scale;

        if(interpolate) {
            const baseScale = new ContinuousScale({key, series}).scale;
            scale = d3Scale
                .scaleSequential()
                .interpolator(interpolate)
                .domain(baseScale.domain());
        }
        else if (set) {
            scale = new CategoricalScale({key, series}).scale.range(set);
        }
        else if (range) {
            const baseScale = new ContinuousScale({key, series}).scale;
            scale = d3Scale
                .scaleSequential()
                .interpolator(piecewise(interpolateRgb.gamma(2.2), range))
                .domain(baseScale.domain());
        }
        else {
            scale = point => point;
        }


        super({key, series, scale});
    }
}
