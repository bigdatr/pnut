// @flow
import sortBy from 'unmutable/sortBy';
import {bisector} from 'd3-array';


export type BaseScale = {
    get: Function,
    scalePoint: Function,
    invert: Function
};

export default function baseScale(config) {
    const {key, series, scale} = config;
    const get = (point) => point && point[key];
    const scalePoint = (point) => scale(get(point));
    const invert = (value) => {
        return series.groups.map(groups => {
            const inverted = scale.invert(value);
            const sorted = sortBy(get)(groups);
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
        scalePoint,
        invert
    };

}

