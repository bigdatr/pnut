// @flow
import Series from './Series';

type Config<Item> = {
    row: string,
    column: string,
    process: <A, B>(A) => B,
    data: Array<Item>
};

export default function GroupedSeries<A>(config: Config<A>): Series<A> {
    const {
        data,
        row,
        column,
        process = s => s
    } = config;

    return Series.group(row, column, data).update(process);
}

