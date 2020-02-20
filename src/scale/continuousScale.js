// @flow
import type Series from '../series/Series';
import type {BaseScale} from './baseScale';

import * as d3Scale from 'd3-scale';
import * as array from 'd3-array';
import baseScale from './baseScale';
import flatten from 'unmutable/flatten';
import isDate from '../util/isDate';


type ScaleConfig = {
    key: string,
    series: Series,
    zero?: boolean,
    clamp?: boolean,
    range?: [number, number]
};

export type ContinuousScale = BaseScale & {
    type: 'continuous',
    scale: Function,
    range: [number, number],
    zero: boolean,
    isNumber: boolean,
    isTime: boolean,
    key: string
};



export default function continuousScale(config: ScaleConfig): ContinuousScale {
    const {key} = config;
    const {series} = config;
    const {zero = false} = config;
    const {clamp = true} = config;
    const {range = []} = config;

    const data = flatten(1)(series.groups);
    const isNumber = data.every(ii => typeof ii[key] === 'number' || ii[key] == null);
    const isDate = data.every(ii => isDate(ii[key]) || ii[key] == null);
    const get = (group) => group[key];

    if(!isNumber && !isDate) throw new Error('Continuous scales must be all numbers or all dates');


    const scaleName = isDate ? 'scaleTime' : 'scaleLinear';
    let domainArray = [
        zero ? 0 : array.min(data, get),
        array.max(data, get)
    ];

    if(series.preprocess.normalizeToPercentage) domainArray = [0, 1];

    const scale = d3Scale[scaleName]()
        .domain(domainArray)
        .range(range)
        .clamp(clamp);

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
