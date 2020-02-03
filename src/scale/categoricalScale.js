// @flow
import {scaleOrdinal, scaleQuantize, scaleBand} from 'd3-scale';
import baseScale from './baseScale';

type ScaleConfig<Data> = {
    column: string,
    data: Data,
    range: [number, number]
};

export type CategoricalScale = {
    type: 'categorical',
    column: string,
    scale: Function
};

export default function categoricalScale<Data>(config: ScaleConfig<Data>): CategoricalScale {
    const {column} = config;
    const {series} = config;
    const {padding} = config;
    const {range = []} = config;
    const data = series.items.flat();

    // create the domain from unique values
    const domain = new Set();
    data.forEach(item => domain.add(item[column]));

    // create a band or ordinal scale if padding is provided
    const scale = padding != null
        ? scaleBand().domain([...domain]).range(range).padding(padding)
        : scaleOrdinal().domain([...domain]).range(range);

    // make sure the inverted base scale is quantized to the original domain items
    scale.invert = scaleQuantize().domain(scale.range()).range(scale.domain());


    return baseScale({
        ...config,
        type: 'categorical',
        scale
    });

}
