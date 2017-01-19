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
    Map,
    List,
    OrderedMap,
    Record
} from 'immutable';

import Column from './Column';

type ChartDatum = string|number|null;
type ChartDataRows = List<Map<string,*>>;
type ChartDataColumns = OrderedMap<string,Map<string,*>>;

/**
 * @class
 *
 * ChartData is an Immutable Record used by pnut charts to represent chart data.
 */

class ChartData extends Record({
    columns: List(),
    rows: List()
}) {

    /**
     * Create a ChartData object.
     *
     * @param {Array<Object>} rows An array of data rows.
     * @param {Array<Object>} columns An array of columns.
     *
     * @memberof ChartData
     */

    constructor(rows: Array<Object>, columns: Array<Object>) {
        const chartDataRows: ChartDataRows = ChartData._createRows(rows);
        const chartDataColumns: ChartDataColumns = ChartData._createColumns(columns, chartDataRows);

        super({
            rows: chartDataRows,
            columns: chartDataColumns
        });

        this._memos = {};
    }

    /*
     * "private" static methods
     */

    static _createRows(rows: Array<Object>): ChartDataRows {
        // only immutablize rows two layers in (quicker than fromJS)
        return List(rows)
            .map(row => Map(row)
                .map(cell => ChartData.isValueValid(cell) ? cell : null)
            );
    }

    static _createColumns(columns: Array<Object>, chartDataRows: ChartDataRows): ChartDataColumns {
        return fromJS(columns)
            .reduce((map, col) => {
                return map.set(
                    col.get('key'),
                    new Column(ChartData._addContinuous(col, chartDataRows))
                );
            }, OrderedMap());
    }

    static _addContinuous(col: Map<string,ChartDatum>, rows: ChartDataRows): Map<string,ChartDatum> {
        if(col.get('isContinuous')) {
            return col;
        }
        const key = col.get('key');
        const isContinuous: boolean = rows
            .find(row => row.get(key) != null, null, Map())
            .update(row => ChartData.isValueContinuous(row.get(key)));

        return col.set('isContinuous', isContinuous);
    }

    /*
     * public static methods
     */

    /**
     * Check if the value is a valid value that ChartData can hold.
     * ChartData can only hold numbers, strings and null.
     *
     * @param {*} value The value to check.
     * @return {boolean} A boolean indicating of the value is valid.
     *
     * @name isValueValid
     * @kind function
     * @memberof ChartData
     * @static
     */

    static isValueValid(value: *): boolean {
        return typeof value === "string"
            || typeof value === "number"
            || value === null;
    }

    /**
     * Check if the value is continuous, which means that the data type has intrinsic order.
     *
     * @param {*} value The value to check.
     * @return {boolean} A boolean indicating of the value is continuous.
     *
     * @name isValueContinuous
     * @kind function
     * @memberof ChartData
     * @static
     */

    static isValueContinuous(value: *): boolean {
        return typeof value === "number";
    }

    /*
     * private methods
     */

    _memoize(key: string, fn: Function): ChartDatum {
        if(this._memos.hasOwnProperty(key)) {
            return this._memos[key];
        }
        const value: ChartDatum = fn();
        this._memos[key] = value;
        return value;
    }

    /*
     * public methods
     */

    /**
     * Get the minimum non-null value in a column.
     *
     * @param {string} columns The name of the column.
     * @return {number|null} The minimum value, or null if no mininum value could be determined.
     *
     * @name min
     * @kind function
     * @inner
     * @memberof ChartData
     */

    min(column: string): ChartDatum {
        return this._memoize('min', (): ChartDatum => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(minBy(ii => ii.get(column)));

            return isNaN(result) ? null : result;
        });
    }

    /**
     * Get the maximum value in a column.
     *
     * @param {string} columns The name of the column.
     * @return {number|null} The maximum value, or null if no maximum value could be determined.
     *
     * @name max
     * @kind function
     * @inner
     * @memberof ChartData
     */

    max(column: string): ChartDatum {
        return this._memoize('max', (): ChartDatum => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(maxBy(ii => ii.get(column)));

            return isNaN(result) ? null : result;
        });
    }

    /**
     * Get the sum of the values in a column.
     *
     * @param {string} columns The name of the column.
     * @return {number} The sum of the values.
     *
     * @name sum
     * @kind function
     * @inner
     * @memberof ChartData
     */

    sum(column: string): ChartDatum {
        return this._memoize('sum', (): ChartDatum => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(sumBy(ii => ii.get(column)));

            return result;
        });
    }

    /**
     * Get the average of the values in a column.
     *
     * @param {string} columns The name of the column.
     * @return {number|null} The average of the values, or null if no average could be determined.
     *
     * @name average
     * @kind function
     * @inner
     * @memberof ChartData
     */

    average(column: string): ChartDatum {
        return this._memoize('average', (): ChartDatum => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(averageBy(ii => ii.get(column)));

            return isNaN(result) ? null : result;
        });
    }

    /**
     * Get the median of the values in a column.
     *
     * @param {string} columns The name of the column.
     * @return {number|null} The median of the values, or null if no median could be determined.
     *
     * @name median
     * @kind function
     * @inner
     * @memberof ChartData
     */

    median(column: string): ChartDatum {
        return this._memoize('median', (): ChartDatum => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(medianBy(ii => ii.get(column)));

            return isNaN(result) ? null : result;
        });
    }
}

export default ChartData;
