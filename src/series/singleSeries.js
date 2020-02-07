// @flow
import Series from './Series';

type Config<Item> = {
    group: string,
    data: Array<Item>,
    process?: <A, B>(A) => B
};

export default function SingleSeries<A>(config: Config<A>): Series<A> {
    const {
        data,
        group,
        process = s => s
    } = config;

    return Series.of({
        type: 'single',
        rawData: data,
        groupKey: group,
        pointKey: null,
        groups: [data]
    }).update(process);
}

