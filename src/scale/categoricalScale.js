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
    const {data} = config;
    const {range = []} = config;

    const domain = new Set();
    data.forEach(item => domain.add(item[column]));

    return {
        type: 'categorical',
        column,
        get: (item) => item[column],
        scale: d3Scale.scaleOrdinal()
            .domain([...domain])
            .range(range)
    };

}
