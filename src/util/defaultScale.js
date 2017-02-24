// @flow

import * as d3Scale from 'd3-scale';
import {Set} from 'immutable';
import ChartData from '../chartdata/ChartData';

// create a set of booleans to check if a group is mixing dimension types
function isContinuous(columns: Set, data: Object): Set {
    return columns
        .map((columnName: string): boolean => {
            return data.getIn(['columns', columnName, 'isContinuous']);
        });
}

function isDate(columns: Set, data: Object): Set {
    return columns
        .map((columnName: string): boolean  => {
            return ChartData.isValueDate(data.getIn(['rows', 0, columnName]));
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
    const continuous = isContinuous(columns, data).get(true);
    const time = isDate(columns, data).get(true);


    const scaleName = scaleType || (
        time
            ? 'scaleTime'
            : continuous
                ? 'scaleLinear'
                : 'scaleBand'
    );

    // if the size is greater than one we have multiple data types
    if(isContinuous(columns, data).size > 1) {
        throw new Error(`A scale cannot share continuous and non continuous data: ${columns.join(', ')}`);
    }

    const domainArray = continuous
        // the domain of continuous data can be a plain min max of columns
        ? [time ? data.min(columns) : 0, data.max(columns)]
        // the domain of non-continuous data has to be an array of all unique values of columns
        : data.getUniqueValues(columns).toArray();


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
