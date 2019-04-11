// @flow
import ChartData from '../chartdata/ChartData';
import type {ChartRow} from '../definitions';

export default function isDate<R: ChartRow>(columns: Array<string>, data: ChartData<R>): Array<boolean> {
    return columns
        .map((columnName: string): boolean  => {
            const row = data.rows[0];
            if(!row) return false;
            return ChartData.isValueDate(row[columnName]);
        });
}

