// @flow

import * as ImmutableMath from 'immutable-math';
import {interpolate} from 'd3-interpolate';

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
export type ChartColumnArg = string|Array<string>|List<string>;

type RowUpdater = (rows: List<ChartRow>) => List<ChartRow>;
type ColumnUpdater = (columns: List<ChartColumn>) => List<ChartColumn>;
type RowMapper = (row: ChartRow) => ChartRow;

/**
 * A valid chart value, which can only accept data of type `string`, `number` and `null`.
 *
 * @typedef ChartScalar
 * @type {string|number|null}
 */

/**
 * An `Object` or `Map` that defines data for a row. Once passed into a `ChartData` constructor
 * these are replaced with equivalent Immutable `Map`s.
 *
 * @typedef ChartRowDefinition
 * @type {Object<string, ChartScalar>|Map<string, ChartScalar>}
 */

/**
 * An Immutable `Map` representing a row of keyed data. Each value is a `ChartScalar`
 * (data of type `string`, `number` or `null`).
 *
 * @typedef ChartRow
 * @type {Map<string,ChartScalar>}
 */

/**
 * This function is passed the `rows` of the current `ChartData`,
 * and should return the new rows to use in the new `ChartData` object.
 *
 * Like the `rows` argument in the `ChartData` constructor, rows can be a `List`
 * or an `Array` of `Map`s or `Object`s.
 *
 * @callback RowUpdater
 * @param {List<ChartRow>} row The `rows` of the current `ChartData`.
 * @return {Array<ChartRowDefinition>|List<ChartRowDefinition>} The replacement `rows`.
 */

/**
 * This function is passed a `List` of `Map`s representing the columns in the current `ChartData`,
 * and should return a new column definitions to use in the new `ChartData` object.
 *
 * Like the `columns` argument in the `ChartData` constructor, columns can be a `List`
 * or an `Array` of `Map`s or `Object`s.
 *
 * @callback ColumnUpdater
 * @param {List<ChartColumnDefinition>} row A `List` of `Map`s representing the columns in the current `ChartData`.
 * @return {List<ChartColumnDefinition>} The replacement columns.
 */


/**
 * A function called for every row in a `ChartData` object, whose results are used to
 * construct a new `ChartData`.
 *
 * Like the individual rows passed to the `rows` argument in the `ChartData` constructor,
 * each row can be a `Map`s or an `Object`.
 *
 * @callback RowMapper
 * @param {ChartRow} row The current row.
 * @param {number} key The key of the current row.
 * @return {ChartRowDefinition} The replacement row.
 */

/**
 * @class
 *
 * ChartData is an Immutable Record used by pnut charts to represent chart data.
 * It stores rows of data objects whose members correspond to columns, and metadata about
 * the columns.
 */

class ChartData extends Record({
    columns: OrderedMap(),
    rows: List()
}) {

    /**
     * Creates a ChartData Record. Data passed in `rows` will be sanitized and any invalid value
     * types will be replaced with `null`.
     *
     * @param {Array<Object<string, ChartScalar>>|List<Map<string, ChartScalar>>} rows
     * An `Array` or `List` of data rows, where each row is an `Object` or `Map` that contains data
     * for a row. Once passed into a `ChartData` constructor these rows are replaced with equivalent
     * Immutable `Map`s.
     *
     * @param {Array<ChartColumnDefinition>|List<ChartColumnDefinition>} columns
     * An `Array` or `List` of columns. These enable you to nominate labels for your columns,
     * and provide a default column order.
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

    constructor(
        rows: Array<ChartRowDefinition>|List<ChartRowDefinition>,
        columns: Array<ChartColumnDefinition>|List<ChartColumnDefinition>|OrderedMap<string,ChartColumn>
    ) {
        const chartDataRows: List<ChartRow> = ChartData._createRows(rows);
        const chartDataColumns: OrderedMap<string,ChartColumn> = ChartData._createColumns(
            columns,
            chartDataRows
        );

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

    static _createColumns(
        columns: Array<ChartColumnDefinition>|List<ChartColumnDefinition>|OrderedMap<string,ChartColumn>,
        chartDataRows: List<ChartRow>
    ): OrderedMap<string,ChartColumn> {

        return fromJS(columns)
            .map(ii => Map(ii)) // required to convert objects to Maps within Lists
            .reduce((map: OrderedMap<string,ChartColumn>, col: Map<string,*>): OrderedMap => {
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
            || (value instanceof Date && !isNaN(value.getTime())) // value is date, and date is not invalid
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
        return typeof value === "number"
            || (value instanceof Date && !isNaN(value.getTime())); // value is date, and date is not invalid
    }

    /**
     * Interpolate takes two `ChartScalar` values and attempts to interpolate between them linearly.
     * It uses [`d3-interpolate`](https://github.com/d3/d3-interpolate) internally,
     * and follows the interpolation rules outlined by its [`interpolate`](https://github.com/d3/d3-interpolate#interpolate) method
     * with the following exceptions:
     *
     * - `blend` must be between 0 and 1 inclusive.
     * - If either value is `null` it will return `null`.
     * - If ether value is `false` according to `ChartData.isContinuous()` then `interpolateDiscrete` is used instead.
     *
     * @example
     * return ChartData.interpolate(10, 20, 0.2); // returns 12
     * return ChartData.interpolate(10, 20, 0.5); // returns 15
     *
     * @param {ChartScalar} valueA The first value.
     * @param {ChartScalar} valueB The second value.
     * @param {number} blend
     * A number from 0 to 1 indicating how much influence each value has on the result. A `blend`
     * of 0.5 will return a number halfway between each value. A `blend` of 0 will equal `valueA`.
     *
     * @return {ChartScalar} The interpolated value.
     *
     * @name interpolate
     * @kind function
     * @memberof ChartData
     * @static
     */

    static interpolate(valueA: ChartScalar, valueB: ChartScalar, blend: number): ChartScalar {
        if(blend == 0) {
            return valueA;
        }
        if(blend == 1) {
            return valueB;
        }
        if(blend < 0 || blend > 1) {
            console.error(`ChartData: blend must be from 0 to 1 inclusive`);
            return null;
        }
        if(valueA == null || valueB == null) {
            return null;
        }
        if(!ChartData.isValueContinuous(valueA) || !ChartData.isValueContinuous(valueB)) {
            return ChartData.interpolateDiscrete(valueA, valueB, blend);
        }
        return interpolate(valueA, valueB)(blend);
    }

    /**
     * Interpolate discrete takes two `ChartScalar` values and returns `valueA`
     * when `blend` is less than 0.5, or `valueB` otherwise. It always treats the values as discrete,
     * even when they are continuous data types such as numbers. It's primarily used for generating
     * "interpolated" values for non-interpolatable data such as strings.
     *
     * @example
     * return ChartData.interpolateDiscrete(10, 20, 0.1); // returns 10
     * return ChartData.interpolateDiscrete(10, 20, 0.5); // returns 20
     *
     * @param {ChartScalar} valueA The first value.
     * @param {ChartScalar} valueB The second value.
     * @param {number} blend
     * A number from 0 to 1 indicating how much influence each value has on the result.
     *
     * @return {ChartScalar} The interpolated value.
     *
     * @name interpolate
     * @kind function
     * @memberof ChartData
     * @static
     */

    static interpolateDiscrete(valueA: ChartScalar, valueB: ChartScalar, blend: number): ChartScalar {
        if(blend < 0 || blend > 1) {
            console.error(`ChartData: blend must be from 0 to 1 inclusive`);
            return null;
        }
        return blend < 0.5 ? valueA : valueB;
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
     * An `OrderedMap` containing this `ChartData`'s column definitions, which are each Immutable
     * Records of type `ChartColumn`.
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

    _columnListError(columnList: List<string>): boolean {
        return columnList.some(ii => this._columnError(ii));
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

    _columnArgList(columns: ChartColumnArg): List<string> {
        if(typeof columns == "string") {
            return List([columns]);
        }
        return fromJS(columns);
    }

    _allValuesForColumns(columnList: List<string>): List<ChartScalar> {
        return this.rows
            .reduce((values: List<ChartScalar>, row: ChartRow): List<ChartScalar> => {
                return values.concat(row
                    .filter((val, key) => columnList.contains(key))
                    .toList()
                );
            }, List());
    }

    _aggregation(operation: string, columns: ChartColumnArg): ?ChartScalar {
        const columnList: List<string> = this._columnArgList(columns);
        if(this._columnListError(columnList)) {
            return null;
        }

        return this._memoize(`${operation}.${columnList.join(',')}`, (): ?ChartScalar => {
            const result: number = this._allValuesForColumns(columnList)
                .filter(val => val != null)
                .update(ImmutableMath[operation]());

            return typeof result != "string" && isNaN(result) ? null : result;
        });
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
     * Returns a new `ChartData` with updated `rows`.
     *
     * @param {RowUpdater} updater
     * @return {ChartData} A new `ChartData` containing the updated rows.
     *
     * @example
     * const chartData = new ChartData(rows, columns);
     * return chartData.update(rows => rows.filter(row => row.get('filterMe')));
     *
     * @name updateRows
     * @kind function
     * @inner
     * @memberof ChartData
     */

    updateRows(updater: RowUpdater): ChartData {
        return new ChartData(updater(this.rows), this.columns);
    }

    /**
     * Returns a new `ChartData` with updated `columns`.
     *
     * @param {ColumnUpdater} updater
     * @return {ChartData} A new `ChartData` containing the updated columns.
     *
     * @example
     * const chartData = new ChartData(rows, columns);
     * const newColumn = {
     *   key: 'month',
     *   label: 'Month'
     * };
     * return chartData.update(col => col.set('month', newColumn));
     *
     * @name updateColumns
     * @kind function
     * @inner
     * @memberof ChartData
     */

    updateColumns(updater: ColumnUpdater): ChartData {
        // interally columns are stored as an OrderedMap of ColumnData records because it's useful
        // but for any user facing stuff it's better to let them define columns as Lists of Maps
        // or Arrays of Objects (a.k.a. ChartColumnDefinitions),
        // so here we convert the interal data structure back to the user facing one
        // for use in the updater().

        const columnDefinitions: List<Map> = this.columns
            .toList()
            .map(col => col.toMap());

        return new ChartData(this.rows, updater(columnDefinitions));
    }

    /**
     * Maps over each row, calling `mapper` for each row, and constructs a new `ChartData`
     * from the results.
     *
     * If you want to return something other than a `ChartData`, use `chartData.rows.map()`.
     *
     * @param {RowMapper} mapper
     * @return {ChartData} A new `ChartData` containing the mapped rows.
     *
     * @example
     * const chartData = new ChartData(rows, columns);
     * return chartData.mapRows(ii => ii * 2);
     *
     * @name mapRows
     * @kind function
     * @inner
     * @memberof ChartData
     */

    mapRows(mapper: RowMapper): ChartData {
        return new ChartData(this.rows.map(mapper), this.columns);
    }

    /**
     * Returns all the data in a single column.
     *
     * @param {string} columns The name of the column.
     * @return {?List<ChartScalar>} A list of the data, or null if columns have been set but the
     * column could not be found.
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
     * For a given column, this returns a `List` of unique values in that column, in the order that
     * each unique value first appears in `rows`.
     *
     * You can also return the number of unique values by calling `getUniqueValues().size`.
     *
     * @param {string} column The name of the column.
     *
     * @return {List<ChartScalar>|null}
     * A `List` of unique values in the order they appear in `rows`, or null if columns have been
     * set but the column could not be found.
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
     * This breaks `rows` data into frames, which are rows grouped by unique values of a
     * specifed `frameColumn`.
     *
     * This method assumes that rows in the `frameColumn` are already sorted in the correct order.
     *
     * @param {string} column The name of the column.
     *
     * @return {List<List<ChartRow>>|null}
     * A `List` of frames, where each frame is a `List`s of chart rows, or null if columns have been
     * set but the column could not be found.
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
     * This make `rows` data into frames returns a new `ChartData` containing only data at the given
     * frame index.
     *
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
     * @param {string} frameColumn
     * The name of the column to group by and break into frames. Often this column contains
     * time-based data.
     *
     * @param {number} index
     * The index to retrieve. Like an array, this can be an integer from 0 to the total number of
     * frames minus one.
     *
     * @return {ChartData|null} A new `ChartData` containing rows from the specified frame index,
     * or `null` if any arguments are invalid.
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
            const frames: List<List<ChartRow>> = this.makeFrames(frameColumn);
            if(this._indexError(index, frames.size - 1)) {
                return null;
            }
            return new ChartData(frames.get(index), this.columns);
        });
    }

    /**
     * Like `frameAtIndex`, this breaks `rows` data into frames, but this can also work with
     * non-integer `index`es and will interpolate continuous non-primary values.
     *
     * This method assumes that rows in the `frameColumn` and in `primaryColumn` are already sorted
     * in the correct order. This is because both of these may contain non-continuous data,
     * and it's best to leave the sorting of non-continuous data up to the user.
     *
     * Also unlike most other `ChartData` methods, this method's results are not memoized, however
     * it does rely on some memoized data in its calculation.
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
     * @param {string} frameColumn
     * The name of the column to group by and break into frames. Often this column contains
     * time-based data.
     *
     * @param {string} primaryColumn
     * The column that will be charted on the primary dimension.
     * This is required because data points must be uniquely identifiable for this function to know
     * which data points to interpolate between.
     * Data in the primary column is not interpolated; its values are treated as ordered but discrete.
     *
     * @param {number} index
     * The index to retrieve. This can be an integer from 0 to the total number of frames minus one,
     * and allows non-integer values.
     *
     * @return {ChartData|null}
     * A new `ChartData` containing rows from the specified frame index, or `null` if any arguments
     * are invalid.
     *
     * @name frameAtIndexInterpolated
     * @kind function
     * @inner
     * @memberof ChartData
     */

    frameAtIndexInterpolated(frameColumn: string, primaryColumn: string, index: number): ?ChartData {
        if(
            this._columnError(frameColumn) ||
            this._columnError(primaryColumn) ||
            this._indexError(index, null, false)
        ) {
            return null;
        }

        if(frameColumn == primaryColumn) {
            console.error(`ChartData: frameColumn and primaryColumn cannot be the same.`);
            return null;
        }

        if(index == Math.round(index)) {
            return this.frameAtIndex(frameColumn, index);
        }

        const frames: List<List<ChartRow>> = this.makeFrames(frameColumn);
        if(this._indexError(index, frames.size - 1, false)) {
            return null;
        }

        // get all values of primary in entire data set, so we can leave gaps where data points may
        // not exist at these data frames
        const allPrimaryValues: List<ChartScalar> = this.getUniqueValues(primaryColumn);
        // get frames on either side of index
        const indexA: number = Math.floor(index);
        const indexB: number = Math.ceil(index);
        // determine how far between the two frames we are
        const blend: number = index - indexA;

        // for each frame, get its data and use its primaryColumn to uniquely identify points that
        // are in both frames
        const frameA: List<ChartRow> = frames
            .get(indexA)
            .groupBy(ii => ii.get(primaryColumn));

        const frameB: List<ChartRow> = frames
            .get(indexB)
            .groupBy(ii => ii.get(primaryColumn));

        const getRowFromFrame = (frame: List<ChartRow>, primaryValue: ChartScalar): ?ChartRow => {
            const rowList: ?List<ChartRow> = frame.get(primaryValue);
            if(!rowList || rowList.size == 0) {
                return null;
            }
            const first: ChartRow = rowList.first();
            // when uniquely identifying points, the data may accidentally contain multiple matches,
            // so warn if this happens
            if(rowList.size > 1) {
                console.warn(`ChartData: Two data points found where ${frameColumn}=${first.get(frameColumn)} and ${primaryColumn}=${String(primaryValue)}, using first data point.`);
            }
            return first;
        };

        // for all primaryValues, find matching data points in both frames
        const interpolatedFrame: List<ChartRow> = allPrimaryValues
            .map((primaryValue: ChartScalar): ?ChartRow => {
                const rowA: ?ChartRow = getRowFromFrame(frameA, primaryValue);
                const rowB: ?ChartRow = getRowFromFrame(frameB, primaryValue);

                // one of the data points doesn't exist, we can't continue
                // although in future we could interpolate to missing continuous
                // values if we can work out what to do with all non-continuous ones,
                // and if it's reasonable that frameAtIndexInterpolated make up new data points
                if(!rowA || !rowB) {
                    return null;
                }

                // for each column, try to interpolate values
                return this.columns.reduce((map: ChartRow, column: ChartColumn): ChartRow => {
                    const {key, isContinuous} = column;
                    // use interpolate on continuous non-primary columns
                    // or else keep the data discrete while interpolating
                    const value: ChartScalar = isContinuous && key != primaryColumn
                        ? ChartData.interpolate(rowA.get(key), rowB.get(key), blend)
                        : ChartData.interpolateDiscrete(rowA.get(key), rowB.get(key), blend);

                    return map.set(key, value);
                }, Map());
            })
            .filter(ii => ii != null);

        return new ChartData(interpolatedFrame, this.columns);
    }

    /**
     * Get the minimum non-null value in a column.
     *
     * @param {string|Array<string>|List<string>} columns
     * The names of one or more columns to perform the operation on.
     *
     * @return {number|null} The minimum value, or null if no mininum value could be determined.
     *
     * @name min
     * @kind function
     * @inner
     * @memberof ChartData
     */

    min(columns: ChartColumnArg): ?ChartScalar {
        return this._aggregation("min", columns);
    }

    /**
     * Get the maximum value in a column.
     *
     * @param {string|Array<string>|List<string>} columns
     * The names of one or more columns to perform the operation on.
     *
     * @return {number|null} The maximum value, or null if no maximum value could be determined.
     *
     * @name max
     * @kind function
     * @inner
     * @memberof ChartData
     */

    max(columns: ChartColumnArg): ?ChartScalar {
        return this._aggregation("max", columns);
    }

    /**
     * Get the sum of the values in a column.
     *
     * @param {string|Array<string>|List<string>} columns
     * The names of one or more columns to perform the operation on.
     *
     * @return {number} The sum of the values.
     *
     * @name sum
     * @kind function
     * @inner
     * @memberof ChartData
     */

    sum(columns: string): ?ChartScalar {
        return this._aggregation("sum", columns);
    }

    /**
     * Get the average of the values in a column.
     *
     * @param {string|Array<string>|List<string>} columns
     * The names of one or more columns to perform the operation on.
     *
     * @return {number|null} The average of the values, or null if no average could be determined.
     *
     * @name average
     * @kind function
     * @inner
     * @memberof ChartData
     */

    average(columns: ChartColumnArg): ?ChartScalar {
        return this._aggregation("average", columns);
    }

    /**
     * Get the median of the values in a column.
     *
     * @param {string|Array<string>|List<string>} columns
     * The names of one or more columns to perform the operation on.
     *
     * @return {number|null} The median of the values, or null if no median could be determined.
     *
     * @name median
     * @kind function
     * @inner
     * @memberof ChartData
     */

    median(columns: ChartColumnArg): ?ChartScalar {
        return this._aggregation("median", columns);
    }
}

export default ChartData;
