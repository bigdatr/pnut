// @flow
import type {Point} from './Series';
import Series from './Series';

type SingleSeriesConfig = {
    data: Array<Point>
};

export default class SingleSeries extends Series {
    constructor({data}: SingleSeriesConfig) {
        super({
            groupKey: [],
            rawData: data,
            groups: [data]
        });
    }
}
