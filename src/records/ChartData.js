// @flow

import {
    minBy,
    maxBy,
    sumBy,
    averageBy,
    medianBy
} from 'immutable-math';

import {
    fromJS,
    List,
    Record
} from 'immutable';

type Datum = string | number | boolean | null;

class ChartData extends Record({
    columns: List(),
    rows: List()
}) {
    constructor(rows: Array<Object>, columns: Array<Object>) {
        super({
            rows: fromJS(rows),
            columns: fromJS(columns)
        });
        this._memos = {};
    }

    _memoize(key: string, fn: Function): Datum {
        if(this._memos.hasOwnProperty(key)) {
            return this._memos[key];
        }
        const value: Datum = fn();
        this._memos[key] = value;
        return value;
    }

    min(column: string): Datum {
        return this._memoize('min', (): Datum => {
            return this.rows.update(minBy(ii => ii.get(column)));
        });
    }

    max(column: string): Datum {
        return this._memoize('max', (): Datum => {
            return this.rows.update(maxBy(ii => ii.get(column)));
        });
    }

    sum(column: string): Datum {
        return this._memoize('sum', (): Datum => {
            return this.rows.update(sumBy(ii => ii.get(column)));
        });
    }

    average(column: string): Datum {
        return this._memoize('average', (): Datum => {
            return this.rows.update(averageBy(ii => ii.get(column)));
        });
    }

    median(column: string): Datum {
        return this._memoize('median', (): Datum => {
            return this.rows.update(medianBy(ii => ii.get(column)));
        });
    }
}

export default ChartData;
