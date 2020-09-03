// @flow
import type {Point} from './Series';
import Series from './Series';

type SingleSeriesConfig = {
    data: Array<Point>,
    pointKey: string
};

export default class SingleSeries extends Series {
    constructor({data, pointKey}: SingleSeriesConfig) {
        super({
            pointKey,
            groupKey: [],
            rawData: data,
            groups: [data]
        });
    }
}
