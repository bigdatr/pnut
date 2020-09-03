// @flow
import type Series from '../series/Series';

import * as d3Scale from 'd3-scale';
import * as array from 'd3-array';
import Scale from './baseScale';
import flattenArray from '../util/flattenArray';
import isValueDate from '../util/isDate';


type ScaleConfig = {
    key: string,
    series: Series,
    zero?: boolean,
    clamp?: boolean,
    range?: [number, number]
};

export default class ContinuousScale extends Scale {
    zero: boolean;
    clamp: boolean;

    constructor(config: ScaleConfig) {
        const {key} = config;
        const {series} = config;
        const {range = []} = config;
        const {zero = false} = config;
        const {clamp = true} = config;

        const data = flattenArray(series.groups);
        const isNumber = data.every(ii => typeof ii[key] === 'number' || ii[key] == null);
        const isDate = data.every(ii => isValueDate(ii[key]) || ii[key] == null);
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

        super({
            series,
            key,
            scale
        });

        this.zero = zero;
        this.clamp = clamp;
    }
}
