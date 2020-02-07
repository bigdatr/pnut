// @flow
import set from 'unmutable/set';

type Config = {
    type: 'points' | 'groups',
    key: string
};
export default function stack(config: Config) {
    const {key} = config;
    const {type = 'points'} = config;
    return (series) => {
        series.preprocess.stacked = true;
        series.preprocess.stackType = type;

        const next = series[type === 'points' ? 'mapPoints' : 'mapGroups']((direction) => {
            const nextDirection = [];
            let sum = 0;
            direction.map((item, index) => {
                sum += (item[key] || 0);
                nextDirection[index] = set(key, sum)(item);
                nextDirection[index].originalValue = item[key];
            });
            return nextDirection;
        });

        return next;

    };
}
