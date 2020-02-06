// @flow
import type {Scale} from '../definitions';

import ChartData from '../chartdata/ChartData';
import * as d3Scale from 'd3-scale';
import * as array from 'd3-array';
import sortBy from 'unmutable/sortBy';
import baseScale from './baseScale';


type ScaleConfig<Data> = {
    column: string,
    data: Data,
    zero?: boolean,
    clamp?: boolean,
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
    const {clamp = true} = config;
    const {range = []} = config;

    const data = series.rows.flat();
    const isNumber = data.every(ii => typeof ii[column] === 'number' || ii[column] == null);
    const isDate = data.every(ii => ChartData.isValueDate(ii[column]) || ii[column] == null);
    const get = (row) => row[column];

    if(!isNumber && !isDate) throw new Error('Continuous scales must be all numbers or all dates');


    const scaleName = isDate ? 'scaleTime' : 'scaleLinear';
    let domainArray = [
        zero ? 0 : array.min(data, get),
        array.max(data, get)
    ];

    if(series.preprocess.normalizeToPercentage) domainArray = [0, 1];

    const scale = d3Scale[scaleName]().domain(domainArray).range(range).clamp(clamp);

    return baseScale({
        ...config,
        type: 'continuous',
        domain: domainArray,
        scale,
        zero,
        isNumber,
        isDate
    });
}
