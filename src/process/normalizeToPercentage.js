// @flow
import set from 'unmutable/set';
import update from 'unmutable/update';
import pipeWith from 'unmutable/pipeWith';

type Config = {
    column: string
};
export default function normalizeToPercentage(config: Config) {
    const {key} = config;
    return (series) => {
        series.preprocess.normalizeToPercentage = true;
        series.preprocess.stacked = true;
        series.preprocess.stackType = 'columns';

        const next = series.mapColumns((column, columnIndex) => {
            const total = column.reduce((rr, point) => rr + (point[key] || 0), 0);
            let sum = 0;
            const nextColumns = column.map(point => {
                let next = Object.assign({}, point);
                next.originalValue = next[key];
                sum += (next[key] || 0)
                next[key] = sum / total;
                return next;

            });
            return nextColumns;
        });
        return next;
    };
}
