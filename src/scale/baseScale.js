// @flow
import sortBy from 'unmutable/sortBy';
import {bisector} from 'd3-array';


export default function BaseScale(config) {
    const {column, series, scale} = config;
    const get = (row) => row && row[column];
    const scaleRow = (row) => scale(get(row));
    const invert = (value) => {
        return series.items.map(rows => {
            const inverted = scale.invert(value);
            const sorted = sortBy(get)(rows);
            const bisect = bisector(get);
            const index = bisect.right(sorted, inverted);
            const d0 = sorted[Math.max(0, index - 1)];
            const d1 = sorted[index];
            if(!d0) return d1;
            if(!d1) return d0;
            return inverted - get(d0) > get(d1) - inverted ? d1 : d0;
        });
    };

    return {
        ...config,
        get,
        scaleRow,
        invert
    };

}

