// @flow
import type Series from '../series/Series';

import sortBy from 'unmutable/sortBy';
import chunkBy from 'unmutable/chunkBy';
import pipeWith from 'unmutable/pipeWith';
import set from 'unmutable/set';

type Config<Point> = {
    key: string,
    threshold: number,
    accumulate: (Array<Point>) => Point
};
export default function binLongTail<Point>(config: Config<Point>) {
    const {key} = config;
    const {threshold} = config;
    const {accumulate} = config;
    const get = (data, key) => data[key] || 0;

    return (series: Series) => {
        series.preprocess.binned = true;

        return series.mapPoints((point) => {
            const total = point.reduce((rr, group) => rr + get(group, key), 0);

            let split = false;
            const [big, small = []] = pipeWith(
                point,
                sortBy(ii => get(ii, key) * -1),
                chunkBy(ii => {
                    const check = get(ii, key) / total < threshold;
                    if(check && !split) {
                        split = true;
                        return check;
                    }
                    return false;
                })
            );

            let accumulated = small.length > 0 ? accumulate(small) : [];
            let next = big
                .concat(accumulated)
                .concat(small.map(set(key, null)));

            return next;

        });

    };
}
