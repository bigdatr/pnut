// @flow
import {Map} from 'immutable';

export default function applyDimension(dimension: Map<*, *>, props: Map<*, *>): Map<*, *> {
    return dimension
        .set('columnName', props.get(dimension.get('columnKey')))
        .set('scaleGroupName', props.get(dimension.get('scaleGroupKey')))
        .set('scaleName', props.get(dimension.get('scaleKey')))
        .set('scaleTypeName', props.get(dimension.get('scaleTypeKey')))
        .set('scaleUpdate', props.get(dimension.get('scaleUpdateKey')));
}
