// @flow
//
export default function applyDimension(dimension: Dimension, props: Object): Object {
    const {columnKey, scaleKey, scaleTypeKey, scaleGroupKey} = dimension;
    return {
        ...dimension,
        columnName: props[columnKey],
        scaleName: props[scaleKey],
        scaleGroupName: props[scaleGroupKey],
        scaleTypeName: props[scaleTypeKey]
    };
}
