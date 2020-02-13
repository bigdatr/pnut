// @flow
import type Series from '../series/Series';

type Config = {
    type: 'points' | 'groups',
    key: string
};
export default function stack(config: Config) {
    const {key} = config;
    const {type = 'points'} = config;
    return (old: Series) => {
        const series = old.copy();

        series.preprocess.stacked = true;
        series.preprocess.stackType = type;

        const stacker = (direction) => {
            let sum = 0;
            const nextDirection = direction.map(point => {
                let next = Object.assign({}, point);
                next.originalValue = next.originalValue || next[key];
                sum += (next[key] || 0);
                next[key] = sum;
                return next;
            });
            return nextDirection;
        };

        return type === 'points'
            ? series.mapPoints(stacker)
            : series.mapGroups(stacker)
        ;

    };
}
