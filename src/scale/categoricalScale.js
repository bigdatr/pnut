// @flow
import * as d3Scale from 'd3-scale';
import * as array from 'd3-array';
import sortBy from 'unmutable/sortBy';

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
    const invertedScale = d3Scale.scaleQuantize().domain(scale.range()).range(scale.domain());
    scale.invert = invertedScale;

    return {
        type: 'categorical',
        column,
        get,
        invert: (value) => {
            const inverted = scale.invert(value);
            const sorted = sortBy(get)(data);
            const bisect = array.bisector(get);
            const index = bisect.right(sorted, inverted);
            return sorted[Math.max(0, index - 1)];
        },
        scale,
        scaleRow: (row) => scale(get(row))
    };

}
