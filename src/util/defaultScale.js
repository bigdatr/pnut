import * as d3Scale from 'd3-scale';
import {List, Set} from 'immutable';

// create a set of booleans to check if a group is mixing dimension types
function isContinuousSet(list: List, data: Object): Set {
    return list
        .map(dd => data.columns.getIn([dd, 'isContinuous']))
        .toSet();
}

export default function defaultScale(dimension: Object, props: Object): Function {
    const {dimensionName, scaleTypeKey, scaleGroupKey, columnKey, groups} = dimension;

    // columnKey should only ever be singular.
    // Make it a list of one to reuse isContinuousSet logic
    const continuous = isContinuousSet(List.of(props[columnKey]), props.data).get(true);

    // Make the current dimension always a list
    const columns = groups.get(props[scaleGroupKey] || dimensionName);

    const scaleName = props[scaleTypeKey] || (continuous ? 'scaleLinear' : 'scaleBand');

    // if the size is greater than one we have multiple data types
    if(isContinuousSet(List(columns), props.data).size > 1) {
        throw new Error(`${columnKey} cannot share continuous and non continuous data: ${groups.get(props[scaleGroupKey]).join(', ')}`);
    }

    const domainArray = continuous
        ? [props.data.min(columns), props.data.max(columns)]
        : props[columnKey]
            ? props.data.getColumnData(props[columnKey]).toArray()
            : [];



    switch(dimensionName) {
        case 'x':
        case 'y':

            // choose the max value of range based on x/width y/height
            var bound = (dimensionName === 'x') ? props.width : props.height;

            return d3Scale[scaleName]()
                .domain(domainArray)
                .range([0, bound]);

        default:
            return d3Scale[scaleName]()
                .domain(domainArray);
    }
}
