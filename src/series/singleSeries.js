// @flow
import type {Point} from './Series';
import Series from './Series';

type Config = {
    group: string,
    data: Point[],
    process?: <A,B>(A) => B
};

export default function SingleSeries(config: Config): Series {
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

