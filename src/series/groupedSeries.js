// @flow
import Series from './Series';

type Config<Item> = {
    group: string,
    point: string,
    process?: <A, B>(A) => B,
    data: Array<Item>
};

export default function GroupedSeries<A>(config: Config<A>): Series<A> {
    const {
        data,
        group,
        point,
        process = s => s
    } = config;

    return Series.group(group, point, data).update(process);
}

