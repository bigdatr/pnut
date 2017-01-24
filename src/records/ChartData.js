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

import Column from './ChartColumn';
import type {ChartColumnDefinition, ChartColumn} from './ChartColumn';

export type ChartScalar = string|number|null;
export type ChartRowDefinition = {[key: string]: ChartScalar}|Map<string,ChartScalar>;
export type ChartRow = Map<string,ChartScalar>;

/**
 * A valid chart value, which can only accept data of type `string`, `number` and `null`.
 *
 * @typedef ChartScalar
 * @type {string|number|null}
 */

/**
 * An `Object` or `Map` that defines data for a row. Once passed into a `ChartData` constructor these are replaced with equivalent Immutable `Map`s.
 *
 * @typedef ChartRowDefinition
 * @type {Object<string, ChartScalar>|Map<string, ChartScalar>}
 */

/**
 * An Immutable `Map` representing a row of keyed data. Each value is a `ChartScalar` (data of type `string`, `number` or `null`).
 *
 * @typedef ChartRow
 * @type {Map<string,ChartScalar>}
 */

/**
 * @class
 *
 * ChartData is an Immutable Record used by pnut charts to represent chart data.
 * It stores rows of data objects whose members correspond to columns, and metadata about the columns.
 */

class ChartData extends Record({
    columns: OrderedMap(),
    rows: List()
}) {

    /**
     * Creates a ChartData Record. Data passed in `rows` will be sanitized and any invalid value types will be replaced with `null`.
     *
     * @param {Array<Object<string, ChartScalar>>|List<Map<string, ChartScalar>>} rows An `Array` or `List` of data rows, where each row is an `Object` or `Map` that contains data for a row. Once passed into a `ChartData` constructor these rows are replaced with equivalent Immutable `Map`s.
     * @param {Array<ChartColumnDefinition>|List<ChartColumnDefinition>} columns An `Array` or `List` of columns. These enable you to nominate labels for your columns, and provide a default column order.
     *
     * @example
     * const rows = [
     *     {
     *         day: 1,
     *         supply: 34,
     *         demand: 99,
     *         fruit: "apple"
     *     },
     *     {
     *         day: 2,
     *         supply: 32,
     *         demand: 88,
     *         fruit: "apple"
     *     },
     *     {
     *         day: 3,
     *         supply: 13,
     *         demand: 55,
     *         fruit: "orange"
     *     }
     * ];
     *
     * const columns = [
     *     {
     *         key: 'day',
     *         label: 'Day',
     *         isContinuous: true
     *     },
     *     {
     *         key: 'supply',
     *         label: 'Supply (houses)',
     *         isContinuous: true
     *     },
     *     {
     *         key: 'demand',
     *         label: 'Demand (houses)',
     *         isContinuous: true
     *     },
     *     {
     *         key: 'fruit',
     *         label: 'Random fruit',
     *         isContinuous: false
     *     }
     * ];
     *
     * const chartData = new ChartData(rows, columns);
     *
     * @memberof ChartData
     */

    constructor(rows: Array<ChartRowDefinition>|List<ChartRowDefinition>, columns: Array<ChartColumnDefinition>|List<ChartColumnDefinition>) {
        const chartDataRows: List<ChartRow> = ChartData._createRows(rows);
        const chartDataColumns: OrderedMap<string,ChartColumn> = ChartData._createColumns(columns, chartDataRows);

        super({
            rows: chartDataRows,
            columns: chartDataColumns
        });

        // object for storing memoized return data
        this._memos = {};
    }

    /*
     * "private" static methods
     */

    static _createRows(rows: Array<ChartRowDefinition>|List<ChartRowDefinition>): List<ChartRow> {
        // only immutablize rows two layers in (quicker than fromJS)
        return List(rows)
            .map(row => Map(row)
                .map(cell => ChartData.isValueValid(cell) ? cell : null)
            );
    }

    static _createColumns(columns: Array<ChartColumnDefinition>|List<ChartColumnDefinition>, chartDataRows: List<ChartRow>): OrderedMap<string,ChartColumn> {
        return fromJS(columns)
            .reduce((map: OrderedMap<string,ChartColumn>, col: Map<string,*>) => {
                return map.set(
                    col.get('key'),
                    new Column(ChartData._addContinuous(col, chartDataRows))
                );
            }, OrderedMap());
    }

    static _addContinuous(col: Map<string,*>, rows: List<ChartRow>): Map<string,*> {
        if(col.get('isContinuous') || !rows) {
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
     * public data members
     */

    /**
     * A `List` containing all the rows of data.
     *
     * @name rows
     * @member {List<ChartRow>}
     * @memberof ChartData
     * @inner
     */

    /**
     * An `OrderedMap` containing this `ChartData`'s column definitions, which are each Immutable Records of type `ChartColumn`.
     *
     * @name columns
     * @member {OrderedMap<string, ChartColumn>}
     * @memberof ChartData
     * @inner
     */

    /*
     * private methods
     */

    _columnError(column: string): boolean {
        if(!this.columns.get(column)) {
            console.error(`ChartData: column "${column}" not found.`);
            return true;
        }
        return false;
    }

    _indexError(index: number, max: ?number, integer: ?boolean = true): boolean {
        if(index < 0) {
            console.error(`ChartData: index "${index}" must not be smaller than 0.`);
            return true;
        }
        if(max && index > max) {
            console.error(`ChartData: index "${index}" must not be larger than ${max}.`);
            return true;
        }
        if(integer && Math.round(index) != index) {
            console.error(`ChartData: index "${index}" must not be decimal.`);
            return true;
        }
        return false;
    }

    _memoize(key: string, fn: Function): * {
        if(this._memos.hasOwnProperty(key)) {
            return this._memos[key];
        }
        const value: ChartScalar = fn();
        this._memos[key] = value;
        return value;
    }

    /*
     * public methods
     */

    /**
     * Returns all the data in a single column.
     *
     * @param {string} columns The name of the column.
     * @return {?List<ChartScalar>} A list of the data, or null if columns have been set but the column could not be found.
     *
     * @example
     * const chartData = new ChartData(rows, columns);
     * return data.getColumnData('fruit');
     * // returns List("apple", "apple", "orange", "peach", "pear")
     *
     * @name getColumnData
     * @kind function
     * @inner
     * @memberof ChartData
     */

    getColumnData(column: string): List<ChartScalar> {
        if(this._columnError(column)) {
            return null;
        }
        return this._memoize(`getColumnData.${column}`, (): ?List<ChartScalar> => {
            return this.rows.map(row => row.get(column));
        });
    }

    /**
     * For a given column, this returns a `List` of unique values in that column, in the order that each unique value first appears in `rows`.
     * You can also return the number of unique values by calling `getUniqueValues().size`.
     *
     * @param {string} column The name of the column.
     * @return {List<ChartScalar>|null} A `List` of unique values in the order they appear in `rows`, or null if columns have been set but the column could not be found.
     *
     * @name getUniqueValues
     * @kind function
     * @inner
     * @memberof ChartData
     */

    getUniqueValues(column: string): ?List<ChartScalar> {
        if(this._columnError(column)) {
            return null;
        }
        return this._memoize(`getUniqueValues.${column}`, (): ?List<ChartScalar> => {
            return this.rows
                .map(ii => ii.get(column))
                .toOrderedSet()
                .toList();
        });
    }

    /**
     * This breaks `rows` data into frames, which are rows grouped by unique values of a specifed `frameColumn`.
     *
     * This method assumes that rows in the `frameColumn` are already sorted in the correct order.
     *
     * @param {string} column The name of the column.
     * @return {List<List<ChartRow>>|null} A `List` of frames, where each frame is a `List`s of chart rows, or null if columns have been set but the column could not be found.
     *
     * @name makeFrames
     * @kind function
     * @inner
     * @memberof ChartData
     */

    makeFrames(column: string): List<List<ChartRow>> {
        if(this._columnError(column)) {
            return null;
        }
        return this._memoize(`makeFrames.${column}`, (): ?ChartData => {
            return this.rows
                .groupBy(ii => ii.get(column))
                .toList();
        });
    }

    /**
     * This make `rows` data into frames returns a new `ChartData` containing only data at the given frame index.
     * The frames will be sorted in the order that each frame's unique value first appears in `rows`.
     *
     * This method assumes that rows in the `frameColumn` are already sorted in the correct order.
     *
     * @example
     * const rows = [
     *     {
     *         day: 1,
     *         fruit: "apple",
     *         amount: 3
     *     },
     *     {
     *         day: 1,
     *         fruit: "banana",
     *         amount: 4
     *     },
     *     {
     *         day: 2,
     *         fruit: "apple",
     *         amount: 2
     *     },
     *     {
     *         day: 2,
     *         fruit: "banana",
     *         amount: 5
     *     },
     *     {
     *         day: 5,
     *         fruit: "apple",
     *         amount: 0
     *     },
     *     {
     *         day: 5,
     *         fruit: "banana",
     *         amount: 4
     *     },
     * ];
     *
     * // ^ this will have three frame indexes for "day"
     * // as there are three unique values for "day"
     *
     * const chartData = new ChartData(rows, columns);
     * chartData.frameAtIndex("day", 0);
     * // ^ returns a ChartData with only rows from frame index 0,
     * // which includes only points where day = 1
     * chartData.frameAtIndex("day", 2);
     * // ^ returns a ChartData with only rows from frame index 2,
     * // which includes only points where day = 5
     *
     * @param {string} frameColumn The name of the column to group by and break into frames. Often this column contains time-based data.
     * @param {number} index The index to retrieve. Like an array, this can be an integer from 0 to the total number of frames minus one.
     * @return {ChartData|null} A new `ChartData` containing rows from the specified frame index, or `null` if any arguments are invalid.
     *
     * @name frameAtIndex
     * @kind function
     * @inner
     * @memberof ChartData
     */

    frameAtIndex(frameColumn: string, index: number): ?ChartData {
        if(this._columnError(frameColumn) || this._indexError(index)) {
            return null;
        }
        return this._memoize(`frameAtIndex.${frameColumn}[${index}]`, (): ?ChartData => {
            const groupedRows: List<List<ChartRow>> = this.makeFrames(frameColumn);
            if(this._indexError(index, groupedRows.size - 1)) {
                return null;
            }
            return new ChartData(groupedRows.get(index), this.columns);
        });
    }

    /**
     * Like `frameAtIndex`, this breaks `rows` data into frames, but this can also work with non-integer `index`es and will interpolate continuous non-primary values.
     *
     * This method assumes that rows in the `frameColumn` are already sorted in the correct order.
     * Also unlike most other `ChartData` methods, this method is not memoized.
     * This decision will be reassessed once animation performance and memory footprint are analyzed.
     *
     * @example
     * const rows = [
     *     {
     *         day: 1,
     *         price: 10,
     *         amount: 2
     *     },
     *     {
     *         day: 1,
     *         price: 20,
     *         amount: 40
     *     },
     *     {
     *         day: 2,
     *         price: 10,
     *         amount: 4
     *     },
     *     {
     *         day: 2,
     *         price: 20,
     *         amount: 30
     *     }
     * ];

     * const chartData = new ChartData(rows, columns);
     * chartData.frameAtIndexInterpolated("day", "price", 0.5);
     * // ^ returns a ChartData with two data points:
     * // {day: 1.5, price: 10, amount: 3}
     * // {day: 1.5, price: 20, amount: 35}
     *
     * @param {string} frameColumn The name of the column to group by and break into frames. Often this column contains time-based data.
     * @param {string} primaryColumn The column that will be charted on the primary axis.
     * This is required because data points must be uniquely identifiable for this function to know which data points to interpolate between.
     * Data in the primary column is not interpolated; its values are treated as ordered but discrete.
     * @param {number} index The index to retrieve. This can be an integer from 0 to the total number of frames minus one, and allows non-integer values.
     * @return {ChartData|null} A new `ChartData` containing rows from the specified frame index, or `null` if any arguments are invalid.
     *
     * @name frameAtIndexInterpolated
     * @kind function
     * @inner
     * @memberof ChartData
     */

    frameAtIndexInterpolated(frameColumn: string, primaryColumn: string, index: number): ?ChartData {
        if(this._columnError(frameColumn) || this._columnError(primaryColumn) || this._indexError(index, null, false)) {
            return null;
        }

        if(frameColumn == primaryColumn) {
            console.error(`ChartData: frameColumn and primaryColumn cannot be the same.`);
            return null;
        }

        if(index == Math.round(index)) {
            return this.frameAtIndex(frameColumn, index);
        }

        const groupedRows: List<List<ChartRow>> = this.makeFrames(frameColumn);
        if(this._indexError(index, groupedRows.size - 1, false)) {
            return null;
        }

        console.log('index', index);
        console.log('groupedRows', groupedRows);
    }

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

    min(column: string): ?ChartScalar {
        if(this._columnError(column)) {
            return null;
        }
        return this._memoize(`min.${column}`, (): ?ChartScalar => {
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

    max(column: string): ?ChartScalar {
        if(this._columnError(column)) {
            return null;
        }
        return this._memoize(`max.${column}`, (): ?ChartScalar => {
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

    sum(column: string): ChartScalar {
        if(this._columnError(column)) {
            return null;
        }
        return this._memoize(`sum.${column}`, (): ChartScalar => {
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

    average(column: string): ?ChartScalar {
        if(this._columnError(column)) {
            return null;
        }
        return this._memoize(`average.${column}`, (): ?ChartScalar => {
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

    median(column: string): ?ChartScalar {
        if(this._columnError(column)) {
            return null;
        }
        return this._memoize(`median.${column}`, (): ?ChartScalar => {
            const result = this.rows
                .filter(ii => ii.get(column) != null)
                .update(medianBy(ii => ii.get(column)));

            return isNaN(result) ? null : result;
        });
    }
}

export default ChartData;
