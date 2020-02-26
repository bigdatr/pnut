// @flow
import type Series from '../series/Series';
import {scaleOrdinal, scaleQuantize, scaleBand} from 'd3-scale';
import Scale from './baseScale';
import flatten from 'unmutable/flatten';

type CategoricalScaleConfig = {
    key: string,
    series: Series,
    padding?: number,
    range?: [number, number]
};

export default class CategoricalScale extends Scale {
    constructor(config: CategoricalScaleConfig) {
        const {key, series, padding, range = []} = config;
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


        super({key, series, scale});
    }

}


