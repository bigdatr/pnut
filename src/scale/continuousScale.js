// @flow
import type {Scale} from '../definitions';

import ChartData from '../chartdata/ChartData';
import * as d3Scale from 'd3-scale';
import * as array from 'd3-array';
import sortBy from 'unmutable/sortBy';


type ScaleConfig<Data> = {
    column: string,
    data: Data,
    zero?: boolean,
    updateScale?: Scale => Scale,
    range: [number, number]
};

export type ContinuousScale = {
    type: 'continuous',
    scale: Function,
    range: [number, number],
    zero: boolean,
    isNumber: boolean,
    isTime: boolean,
    column: string
};


export default function continuousScale<Data: Data[]>(config: ScaleConfig<Data>): Function {
    const {column} = config;
    const {series} = config;
    const {zero = false} = config;
    const {range = []} = config;

    const data = series.items.flat();

    const isNumber = data.every(ii => typeof ii[column] === 'number' || ii[column] == null);
    const isDate = data.every(ii => ChartData.isValueDate(ii[column]));
    const value = (row) => row[column];

    if(!isNumber && !isDate) throw new Error('Continuous scales must be all numbers or all dates');


    const scaleName = isDate ? 'scaleTime' : 'scaleLinear';
    const domainArray = [
        zero ? 0 : array.min(data, value),
        array.max(data, value)
    ];

    const scale = d3Scale[scaleName]().domain(domainArray).range(range);
    const get = x => x[column];

    return {
        type: 'continuous',
        scale,
        get,
        scaleRow: (row) => scale(get(row)),
        invert: (value, smallSet) => {
            const inverted = scale.invert(value);
            const sorted = sortBy(get)(smallSet || data);
            const bisect = array.bisector(get);
            const index = bisect.right(sorted, inverted);
            return sorted[Math.max(0, index - 1)];
        },
        range,
        column,
        zero,
        isNumber,
        isDate
    };
}
