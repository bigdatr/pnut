// @flow
import {Map} from 'immutable';

export default function applyDimension(dimension: Map, props: Map): Map {
    return dimension
        .set('columnName', props.get(dimension.get('columnKey')))
        .set('scaleName', props.get(dimension.get('scaleKey')))
        .set('scaleGroupName', props.get(dimension.get('scaleGroupKey')))
        .set('scaleTypeName', props.get(dimension.get('scaleTypeKey')));
}
