// @flow
import ChartData from '../chartdata/ChartData';
import type {ChartRow} from '../definitions';

export default function isContinuous<R: ChartRow>(columns: Array<string>, data: ChartData<R>): Array<boolean> {
    return columns
        .map((columnName: string): boolean => {
            const column = data.columns.find(ii => ii.key === columnName);
            return !!column && column.isContinuous;
        });
}

