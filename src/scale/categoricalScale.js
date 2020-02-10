// @flow
import type {BaseScale} from './baseScale';
import type Series from '../series/Series';
import {scaleOrdinal, scaleQuantize, scaleBand} from 'd3-scale';
import baseScale from './baseScale';
import flatten from 'unmutable/flatten';

type CategoricalScaleConfig = {
    key: string,
    series: Series,
    padding?: number,
    range?: [number, number]
};

export type CategoricalScale = BaseScale & {
    type: 'categorical',
    scale: Function
};

export default function categoricalScale(config: CategoricalScaleConfig): CategoricalScale {
    const {key} = config;
    const {series} = config;
    const {padding} = config;
    const {range = []} = config;
    const data = flatten(1)(series.groups);

    // create the domain from unique values
    const domain = new Set();
    data.forEach(item => domain.add(item[key]));

    // create a band or ordinal scale if padding is provided
    const scale = padding != null
        ? scaleBand()
            .domain([...domain])
            .range(range)
            .padding(padding)
        : scaleOrdinal()
            .domain([...domain])
            .range(range);

    // make sure the inverted base scale is quantized to the original domain items
    scale.invert = scaleQuantize().domain(scale.range()).range(scale.domain());


    return baseScale({
        ...config,
        type: 'categorical',
        scale
    });

}
