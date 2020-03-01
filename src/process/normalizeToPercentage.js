// @flow
import type Series from '../series/Series';

type Config = {
    key: string
};
export default function normalizeToPercentage(config: Config) {
    const {key} = config;
    return (old: Series) => {
        const series = old.copy();
        series.preprocess.normalizeToPercentage = true;

        const next = series.mapPoints((point) => {
            const total = point.reduce((rr, point) => rr + (point[key] || 0), 0);
            //let sum = 0;
            const nextPoints = point.map(point => {
                let next = Object.assign({}, point);
                next.originalValue = next.originalValue || next[key];
                next.percentValue = ((next.originalValue || 0) / total);
                next[key] = next.percentValue;
                //next[key] = (next[key] || 0) / total;
                return next;

            });
            return nextPoints;
        });
        return next;
    };
}
