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

/**
 * @class
 *
 * ChartData is an Immutable Record used by pnut charts to represent chart data.
 */

class ChartData {

    /**
     * Create a ChartData object
     *
     * @param {Array<Object>} rows An array of data rows
     * @param {Array<Object>} columns An array of columns
     *
     * @memberOf ChartData
     */

    constructor(rows: Array<Object>, columns: Array<Object>) {
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

    /**
     * Get the minimum non-null value in a column.
     *
     * @param {string} columns The name of the column
     * @return {number|null} The minimum value, or null if no mininum value could be determined
     *
     * @memberOf ChartData
     */

    min(column: string): Datum {
        return this._memoize('min', (): Datum => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(minBy(ii => ii.get(column)));

            return isNaN(result) ? null : result;
        });
    }

    /**
     * Get the maximum value in a column.
     *
     * @param {string} columns The name of the column
     * @return {number|null} The maximum value, or null if no maximum value could be determined
     *
     * @memberOf ChartData
     */

    max(column: string): Datum {
        return this._memoize('max', (): Datum => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(maxBy(ii => ii.get(column)));

            return isNaN(result) ? null : result;
        });
    }

    /**
     * Get the sum of the values in a column.
     *
     * @param {string} columns The name of the column
     * @return {number} The sum of the values
     *
     * @memberOf ChartData
     */

    sum(column: string): Datum {
        return this._memoize('sum', (): Datum => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(sumBy(ii => ii.get(column)));

            return result;
        });
    }

    /**
     * Get the average of the values in a column.
     *
     * @param {string} columns The name of the column
     * @return {number|null} The average of the values, or null if no average could be determined
     *
     * @memberOf ChartData
     */

    average(column: string): Datum {
        return this._memoize('average', (): Datum => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(averageBy(ii => ii.get(column)));

            return isNaN(result) ? null : result;
        });
    }

    /**
     * Get the median of the values in a column.
     *
     * @param {string} columns The name of the column
     * @return {number|null} The median of the values, or null if no median could be determined
     *
     * @memberOf ChartData
     */

    median(column: string): Datum {
        return this._memoize('median', (): Datum => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(medianBy(ii => ii.get(column)));

            return isNaN(result) ? null : result;
        });
    }
}

export default ChartData;
