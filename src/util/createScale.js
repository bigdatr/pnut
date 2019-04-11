// @flow
import type ChartData from '../chartdata/ChartData';
import type {ChartRow} from '../definitions';
import type {Scale} from '../definitions';

import * as d3Scale from 'd3-scale';

import isContinuous from './isContinuous';
import isDate from './isDate';

export type ScaleConfig<R> = {
    columns: Array<string>,
    data: ChartData<R>,
    scaleType?: string,
    updateScale?: Scale => Scale,
    upperBound?: number
};

export default function createScale<R: ChartRow>(config: ScaleConfig<R>): Function {
    const {columns} = config;
    const {scaleType} = config;
    const {data} = config;
    const {upperBound} = config;

    const continuousList = isContinuous(columns, data);

    // are any of the columns continuous.
    const continuous = continuousList.includes(true);
    const time = isDate(columns, data).includes(true);


    const scaleName = scaleType || (
        time
            ? 'scaleTime'
            : continuous
                ? 'scaleLinear'
                : 'scaleBand'
    );

    // if the size is greater than one we have multiple data types
    if(new Set(continuousList).size > 1) {
        throw new Error(`A scale cannot share continuous and non continuous data: ${columns.join(', ')}`);
    }

    const domainArray = continuous
        // the domain of continuous data can be a plain min max of columns
        ? [time ? data.min(columns) : 0, data.max(columns)]
        // the domain of non-continuous data has to be an array of all unique values of columns
        : data.getUniqueValues(columns);

    if(upperBound) {
        return d3Scale[scaleName]()
            .domain(domainArray)
            .range([0, upperBound]);
    }

    return d3Scale[scaleName]()
        .domain(domainArray)
        .range(domainArray);
}
