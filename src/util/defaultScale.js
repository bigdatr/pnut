// @flow

import * as d3Scale from 'd3-scale';
import ChartData from '../chartdata/ChartData';
import type {ChartRow} from '../definitions';

// create a set of booleans to check if a group is mixing dimension types
function isContinuous<R: ChartRow>(columns: Array<string>, data: ChartData<R>): Array<boolean> {
    return columns
        .map((columnName: string): boolean => {
            const column = data.columns.find(ii => ii.key === columnName);
            return !!column && column.isContinuous;
        });
}

function isDate<R: ChartRow>(columns: Array<string>, data: ChartData<R>): Array<boolean> {
    return columns
        .map((columnName: string): boolean  => {
            const row = data.rows[0];
            if(!row) return false;
            return ChartData.isValueDate(row[columnName]);
        });
}

export default function defaultScale(scaleProps: Object): Function {
    const {
        primitiveDimension,
        columns,
        scaleType,
        primitiveDimensionProps,
        data
    } = scaleProps;


    // are any of the columns continuous.
    const continuous = isContinuous(columns, data).includes(true);
    const time = isDate(columns, data).includes(true);


    const scaleName = scaleType || (
        time
            ? 'scaleTime'
            : continuous
                ? 'scaleLinear'
                : 'scaleBand'
    );

    // if the size is greater than one we have multiple data types
    if(new Set(isContinuous(columns, data)).size > 1) {
        throw new Error(`A scale cannot share continuous and non continuous data: ${columns.join(', ')}`);
    }

    const domainArray = continuous
        // the domain of continuous data can be a plain min max of columns
        ? [time ? data.min(columns) : 0, data.max(columns)]
        // the domain of non-continuous data has to be an array of all unique values of columns
        : data.getUniqueValues(columns);


    switch(primitiveDimension) {
        case 'x':
        case 'y':

            // choose the max value of range based on x/width y/height
            var bound = (primitiveDimension === 'x') ? primitiveDimensionProps.width : primitiveDimensionProps.height;

            return d3Scale[scaleName]()
                .domain(domainArray)
                .range([0, bound]);

        default:
            return d3Scale[scaleName]()
                .domain(domainArray);
    }
}
