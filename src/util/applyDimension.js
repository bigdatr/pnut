// @flow
import type {ChartDimension} from '../component/Chart';
export default function applyDimension(
    dimension: ChartDimension,
    props: Object
): ChartDimension & {
    columnName: string,
    scaleName: string,
    scaleTypeName: string,
    scaleUpdate: Function
} {
    return {
        ...dimension,
        columnName: props[dimension.columnKey],
        scaleName: props[dimension.scaleKey],
        scaleTypeName: props[dimension.scaleTypeKey],
        scaleUpdate: props[dimension.scaleUpdateKey]
    };
}
