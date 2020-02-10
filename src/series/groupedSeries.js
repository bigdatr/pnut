// @flow
import type {Point} from './Series';
import Series from './Series';

type Config = {
    group: string,
    point: string,
    process?: <A,B>(A) => B,
    data: Point[]
};

export default function GroupedSeries(config: Config): Series {
    const {
        data,
        group,
        point,
        process = s => s
    } = config;

    return Series.group(group, point, data).update(process);
}

