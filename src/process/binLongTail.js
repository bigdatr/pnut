// @flow
import sortBy from 'unmutable/sortBy';
import chunkBy from 'unmutable/chunkBy';
import pipeWith from 'unmutable/pipeWith';
import get from 'unmutable/get';
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
    return (series) => {
        series.preprocess.binned = true;


        return series.mapColumns((column) => {
            const total = column.reduce((rr, row) => rr + row[key], 0);

            let split = false;
            const [big, small = []] = pipeWith(
                column,
                sortBy(ii => get(key)(ii) * -1),
                chunkBy(ii => {
                    const check = ((ii[key] || 0) / total) < threshold;
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
