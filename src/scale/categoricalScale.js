// @flow
import * as d3Scale from 'd3-scale';

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
    const {range = []} = config;
    const data = series.items.flat();

    const domain = new Set();
    data.forEach(item => domain.add(item[column]));
    const get = (item) => item[column];
    const scale = d3Scale.scaleOrdinal().domain([...domain]).range(range);

    return {
        type: 'categorical',
        column,
        get,
        scale,
        scaleRow: (row) => scale(get(row))
    };

}
