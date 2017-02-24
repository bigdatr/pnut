// @flow

import * as d3Scale from 'd3-scale';
import {Set} from 'immutable';

// create a set of booleans to check if a group is mixing dimension types
function isContinuous(columns: Set, data: Object): Set {
    return columns
        .map(dd => data.columns.getIn([dd, 'isContinuous']))
        .toSet();
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
    const continuous = true;//isContinuous(columns, data).get(true);

    const scaleName = scaleType || (continuous ? 'scaleLinear' : 'scaleBand');

    // if the size is greater than one we have multiple data types
    // if(isContinuous(columns, data).size > 1) {
    //     throw new Error(`A scale cannot share continuous and non continuous data: ${columns.join(', ')}`);
    // }

    const domainArray = continuous
        // the domain of continuous data can be a plain min max of columns
        ? [0, 1]//data.max(columns)]
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
