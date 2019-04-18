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
    range: [number, number],
    stack?: boolean
};

export default function createScale<R: ChartRow>(config: ScaleConfig<R>): Function {
    const {columns} = config;
    const {scaleType} = config;
    const {data} = config;
    const {range} = config;
    const {stack} = config;

    const continuousList = isContinuous(columns, data);

    // are any of the columns continuous.
    const continuous = continuousList.includes(true);
    const time = isDate(columns, data).includes(true);
    let domainArray;


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

    if (continuous) {
        const continuousMin = (time) ? data.min(columns) : 0;
        const continuousMax = (stack)
            ? data.rows.reduce((rr, row) => {
                const sum = columns.reduce((rr, cc) => {
                    const value = row[cc] || 0;
                    if(typeof value !== 'number') throw 'Stacked columns must be numerical';
                    return rr + value;
                }, 0);
                return sum > rr ? sum : rr;
            }, 0)
            : data.max(columns)
        ;

        domainArray = [continuousMin, continuousMax];
    } else {
        // the domain of non-continuous data has to be an array of all unique values of columns
        domainArray = data.getUniqueValues(columns);
    }

    return d3Scale[scaleName]()
        .domain(domainArray)
        .range(range);
}
