// @flow
import get from 'unmutable/get';
import set from 'unmutable/set';

type Config = {
    type: 'columns' | 'rows',
    key: string
};
export default function stack(config: Config) {
    const {key} = config;
    const {type = 'columns'} = config;
    return (series) => {
        series.preprocess.stacked = true;
        series.preprocess.stackType = type;

        const next = series[type === 'columns' ? 'mapColumns' : 'mapRows']((direction, directionIndex) => {
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
