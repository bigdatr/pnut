// @flow

import {interpolate} from 'd3-interpolate';
import {
    min,
    median,
    mean,
    max,
    sum,
    quantile,
    variance,
    deviation,
    histogram,
    thresholdFreedmanDiaconis,
    thresholdScott,
    thresholdSturges
} from 'd3-array';

import type {ChartColumn} from '../definitions';
import type {ChartColumnInput} from '../definitions';
import type {ChartColumnInputList} from '../definitions';
import type {ChartColumnList} from '../definitions';
import type {ChartScalar} from '../definitions';
import type {ChartRow} from '../definitions';


const fastGroupByToArray = <V, F: Function>(rows: Array<V>, grouper: F): Array<Array<V>> => {
    const groupIndexMap: {[key: string]: number} = {};
    let groupedResult: Array<Array<V>> = [];
    rows.forEach((row) => {
        const key = String(grouper(row));
        const groupedIndex = typeof groupIndexMap[key] === 'undefined'
            ? groupedResult.length
            : groupIndexMap[key];
        groupIndexMap[key] = groupedIndex;
        groupedResult[groupedIndex] = groupedResult[groupedIndex] || [];
        groupedResult[groupedIndex].push(row);
    });
    return groupedResult;
};


const fastGroupByToMap = <K, R>(rows: Array<R>, grouper: (R) => K): Map<K, Array<R>> => {
    let groupedResult: Map<K, Array<R>> = new Map();

    rows.forEach((row) => {
        const groupedKey = grouper(row);
        groupedResult.set(groupedKey, (groupedResult.get(groupedKey) || []).concat(row));
    });

    return groupedResult;
};

// type ColumnUpdater = (columns: Array<ChartColumn>) => Array<ChartColumn>;
// type RowMapper = (row: ChartRow) => ChartRow;
type BinThreshold = Array<ChartScalar> | number;
type BinThresholdGenerator = (values: Array<ChartScalar>, min: ?ChartScalar, max: ?ChartScalar, generators: Object) => BinThreshold;
type BinRow = <V>() => ?Array<V>;

/**
 * ChartData is a Class used by pnut charts to represent chart data.
 * It stores rows of data objects whose members correspond to columns, and metadata about
 * the columns.
 */

class ChartData<R: ChartRow> {

    /**
     * Creates a ChartData Record. Data passed in `rows` will be sanitized and any invalid value
     * types will be replaced with `null`.
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
     */

    _rows: Array<R>;
    _columns: ChartColumnList<R>;
    _memoize: <K, V>(key: K, fn: () => V) => V;

    constructor(
        rows: Array<R> = [],
        columns: ChartColumnInputList<R> = []
    ) {
        const chartDataColumns = ChartData._createColumns(columns, rows);

        this._rows = rows;
        this._columns = chartDataColumns;

        // object for storing memoized return data
        this._memoize = this._createMemoize();
    }

    static _createColumns(
        columns: ChartColumnInputList<R>,
        rows: Array<R>
    ): ChartColumnList<R> {
        return columns.map(column => ChartData._addContinuous(column, rows));
    }

    static _addContinuous(col: ChartColumnInput<R>, rows: Array<R>): ChartColumn<R> {
        if(typeof col.isContinuous === 'boolean') return {
            key: col.key,
            label: col.label,
            isContinuous: col.isContinuous
        };

        const key = col.key;
        const nonNullRow = rows.find(row => row[key] != null);
        const rowValue = nonNullRow != null ? nonNullRow[key] : null;
        const isContinuous = ChartData.isValueContinuous(rowValue);

        return {
            key: col.key,
            label: col.label,
            isContinuous: isContinuous
        };
    }

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
            || ChartData.isValueDate(value)
            || value === null;
    }

    /**
     * Check if the value is continuous, which means that the data type has intrinsic order.
     *
     * @param {ChartScalar} value The value to check.
     * @return {boolean} A boolean indicating of the value is continuous.
     *
     * @name isValueContinuous
     * @kind function
     * @memberof ChartData
     * @static
     */

    static isValueContinuous(value: ChartScalar): boolean {
        return typeof value === "number" || ChartData.isValueDate(value);
    }

    /**
     * Check if the value is a date and that the date is not invalid.
     *
     * @param {ChartScalar} value The value to check.
     * @return {boolean} A boolean indicating of the value is a date.
     *
     * @name isValueDate
     * @kind function
     * @memberof ChartData
     * @static
     */

    static isValueDate(value: ChartScalar): boolean {
        // value is date, and date is not invalid
        return value instanceof Date && !isNaN(value.getTime());
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
            // eslint-disable-next-line no-console
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
            // eslint-disable-next-line no-console
            console.error(`ChartData: blend must be from 0 to 1 inclusive`);
            return null;
        }
        return blend < 0.5 ? valueA : valueB;
    }

    /*
     * public data members
     */

    /**
     * An `Array` containing all the rows of data.
     *
     * @name rows
     * @member {List<ChartRow>}
     * @memberof ChartData
     * @inner
     */

    get rows(): Array<R> {
        return this._rows;
    }

    /**
     * An `Array` containing this `ChartData`'s column definitions, which are each
     * of type `ChartColumn`.
     * @name columns
     * @member {Array<ChartColumn>}
     * @memberof ChartData
     * @inner
     */
    get columns(): Array<ChartColumn<R>> {
        return this._columns;
    }

    _columnError(column: string): boolean {
        if(!this.columns.find(ii => ii.key === column)) {
            // eslint-disable-next-line no-console
            console.error(`ChartData: column "${column}" not found.`);
            return true;
        }
        return false;
    }

    _columnListError(columnList: Array<string>): boolean {
        return columnList.some(ii => this._columnError(ii));
    }

    _indexError(index: number, max: ?number, integer: ?boolean = true): boolean {
        if(index < 0) {
            // eslint-disable-next-line no-console
            console.error(`ChartData: index "${index}" must not be smaller than 0.`);
            return true;
        }
        if(max && index > max) {
            // eslint-disable-next-line no-console
            console.error(`ChartData: index "${index}" must not be larger than ${max}.`);
            return true;
        }
        if(integer && Math.round(index) != index) {
            // eslint-disable-next-line no-console
            console.error(`ChartData: index "${index}" must not be decimal.`);
            return true;
        }
        return false;
    }

    _columnArgList(columns: $Keys<R> | Array<$Keys<R>>): Array<$Keys<R>> {
        if(typeof columns == "string") {
            return [columns];
        }
        return columns;
    }

    _allValuesForColumns(columnList: Array<$Keys<R>>): Array<ChartScalar> {
        return columnList
            .reduce((list: Array<ChartScalar>, column: $Keys<R>): Array<ChartScalar> => {
                return list.concat(this.rows.map(row => row[column]));
            }, []);
    }

    _aggregation(
        operation: string,
        aggregateFunction: (valueList: Array<ChartScalar>) => ?ChartScalar,
        columns: $Keys<R> | Array<$Keys<R>>
    ): ?ChartScalar {

        const columnList = this._columnArgList(columns);

        if(this._columnListError(columnList)) {
            return null;
        }

        const allValuesForColumns = this._memoize(
            `allValuesForColumns.${columnList.join(',')}`,
            () => this._allValuesForColumns(columnList).filter(val => val != null)
        );

        return this._memoize(`${operation}.${columnList.join(',')}`, (): ?ChartScalar => {
            const result = aggregateFunction(allValuesForColumns);
            return typeof result != "string" && isNaN(result) ? null : result;
        });
    }

    _createMemoize() {
        const registry = new Map();

        return function<K, V>(key: K, fn: () => V): V {
            // $FlowFixMe flow can't handle that value is V for some reason
            let value: V = registry.get(key);
            if(typeof value === 'undefined') {
                value = fn();
                registry.set(key, value);
            }

            return value;
        };
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

    updateRows(updater: (Array<R>) => Array<R>): ChartData<R> {
        return new ChartData(
            updater(this.rows),
            this.columns.map(({key, label, isContinuous}) => ({key, label, isContinuous}))
        );
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

    updateColumns(updater: (ChartColumnList<R>) => ChartColumnList<R>): ChartData<R> {
        return new ChartData(
            this.rows,
            updater(this.columns).map(({key, label, isContinuous}) => ({key, label, isContinuous}))
        );
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

    mapRows(mapper: (R) => R): ChartData<R> {
        return new ChartData(
            this.rows.map(mapper),
            this.columns.map(({key, label, isContinuous}) => ({key, label, isContinuous}))
        );
    }

    /**
     * Returns all the data in a single column.
     *
     * @param {string} column The name of the column.
     * @return {Array<ChartScalar>} A list of the data
     *
     * @example
     * const chartData = new ChartData(rows, columns);
     * return data.getColumnData('fruit');
     * // returns ["apple", "apple", "orange", "peach", "pear"]
     *
     * @name getColumnData
     * @kind function
     * @inner
     * @memberof ChartData
     */

    getColumnData(column: $Keys<R>): ?Array<ChartScalar> {
        if(this._columnError(column)) {
            return null;
        }
        return this._memoize(`getColumnData.${column}`, (): Array<ChartScalar> => {
            return this.rows.map(row => row[column]);
        });
    }

    /**
     * For a given column, or `Array` of columns, this returns a `Array` of unique values in those columns, in the order that
     * each unique value first appears in `rows`.
     *
     * You can also return the number of unique values by calling `getUniqueValues().length`.
     *
     * @param {string|Array<string>} columns
     * The names of one or more columns to perform the operation on.
     *
     * @return {Array<ChartScalar>}
     * A `Array` of unique values in the order they appear in `rows`
     *
     * @name getUniqueValues
     * @kind function
     * @inner
     * @memberof ChartData
     */

    getUniqueValues(columns: $Keys<R> | Array<$Keys<R>>): ?Array<ChartScalar> {
        const columnList = this._columnArgList(columns);
        if(this._columnListError(columnList)) {
            return null;
        }
        return this._memoize(`getUniqueValues.${columnList.join(',')}`, (): Array<ChartScalar> => {
            return [...new Set(this._allValuesForColumns(columnList))];
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
     * @return {Array<Array<ChartRow>>}
     * A `Array` of frames, where each frame is a `Array` of chart rows
     *
     * @name makeFrames
     * @kind function
     * @inner
     * @memberof ChartData
     */

    makeFrames(column: $Keys<R>): ?Array<Array<R>> {
        if(this._columnError(column)) {
            return null;
        }
        return this._memoize(`makeFrames.${column}`, (): Array<Array<R>> => {
            return fastGroupByToArray(this.rows, (row: R) => row[column]);
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

    frameAtIndex(frameColumn: $Keys<R>, index: number): ?ChartData<R> {
        if(this._columnError(frameColumn) || this._indexError(index)) {
            return null;
        }
        return this._memoize(`frameAtIndex.${frameColumn}[${index}]`, (): ?ChartData<R> => {
            const frames: ?Array<Array<R>> = this.makeFrames(frameColumn);
            if(!frames || this._indexError(index, frames.length - 1)) {
                return null;
            }
            return new ChartData(
                frames[index],
                this.columns.map(({key, label, isContinuous}) => ({key, label, isContinuous}))
            );
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

    frameAtIndexInterpolated(
        frameColumn: $Keys<R>,
        primaryColumn: $Keys<R>,
        index: number
    ): ?ChartData<R> {
        if(
            this._columnError(frameColumn) ||
            this._columnError(primaryColumn) ||
            this._indexError(index, null, false)
        ) {
            return null;
        }

        if(frameColumn === primaryColumn) {
            // eslint-disable-next-line no-console
            console.error(`ChartData: frameColumn and primaryColumn cannot be the same.`);
            return null;
        }

        if(index === Math.round(index)) {
            return this.frameAtIndex(frameColumn, index);
        }

        const frames = this.makeFrames(frameColumn);
        if(!frames || this._indexError(index, frames.length - 1, false)) {
            return null;
        }

        // get all values of primary in entire data set, so we can leave gaps where data points may
        // not exist at these data frames
        const allPrimaryValues = this.getUniqueValues(primaryColumn);
        if(!allPrimaryValues) return null;
        // get frames on either side of index
        const indexA = Math.floor(index);
        const indexB = Math.ceil(index);
        // determine how far between the two frames we are
        const blend = index - indexA;

        // for each frame, get its data and use its primaryColumn to uniquely identify points that
        // are in both frames
        const frameA = fastGroupByToMap(frames[indexA], (row: R) => row[primaryColumn]);
        const frameB = fastGroupByToMap(frames[indexB], (row: R) => row[primaryColumn]);

        function getRowFromFrame<F: Map<*,*>>(frame: F, primaryValue: ChartScalar): ?R  {
            const rowList: ?Array<R> = frame.get(primaryValue);
            if(!rowList || rowList.length == 0) {
                return null;
            }
            const first = rowList[0];
            // when uniquely identifying points, the data may accidentally contain multiple matches,
            // so warn if this happens
            if(rowList.length > 1) {
                // eslint-disable-next-line no-console
                console.warn(`ChartData: Two data points found where ${frameColumn}=${String(first[frameColumn])} and ${primaryColumn}=${String(primaryValue)}, using first data point.`);
            }
            return first;
        }

        // for all primaryValues, find matching data points in both frames
        const interpolatedFrame: Array<R> = allPrimaryValues
            .map((primaryValue: ChartScalar) => {
                const rowA: ?R = getRowFromFrame(frameA, primaryValue);
                const rowB: ?R = getRowFromFrame(frameB, primaryValue);

                // one of the data points doesn't exist, we can't continue
                // although in future we could interpolate to missing continuous
                // values if we can work out what to do with all non-continuous ones,
                // and if it's reasonable that frameAtIndexInterpolated make up new data points
                if(!rowA || !rowB) {
                    return null;
                }

                // for each column, try to interpolate values
                return this.columns.reduce((map: R, column: ChartColumn<R>): R => {
                    const {key, isContinuous} = column;
                    // use interpolate on continuous non-primary columns
                    // or else keep the data discrete while interpolating
                    const value: ChartScalar = isContinuous && key != primaryColumn
                        ? ChartData.interpolate(rowA[key], rowB[key], blend)
                        : ChartData.interpolateDiscrete(rowA[key], rowB[key], blend);

                    return {
                        ...map,
                        [key]: value
                    };
                }, ({}: $Shape<R>));
            })
            .filter(Boolean);

        return new ChartData(
            interpolatedFrame,
            this.columns.map(({key, label, isContinuous}) => ({key, label, isContinuous}))
        );
    }

    /**
     * Get the minimum non-null value in a column, or `Array` or `List`, of columns.
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

    min(columns: $Keys<R> | Array<$Keys<R>>): ?ChartScalar {
        return this._aggregation("min", min, columns);
    }

    /**
     * Get the maximum value in a column, or `Array` or `List`, of columns.
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

    max(columns: $Keys<R> | Array<$Keys<R>>): ?ChartScalar {
        return this._aggregation("max", max, columns);
    }

    /**
     * Gets the minimum and maximum non-null value in a column, or `Array` or `List`, of columns,
     * returned as an array of `[min, max]`.
     *
     * @param {string|Array<string>|List<string>} columns
     * The names of one or more columns to perform the operation on.
     *
     * @return {Array<number|null>} An array with two elements, the minimum and maximum value respectively.
     * Both of these elements will be null if no mininum or maximum value could be determined.
     *
     * @name extent
     * @kind function
     * @inner
     * @memberof ChartData
     */

    extent(columns: $Keys<R> | Array<$Keys<R>>): [?ChartScalar, ?ChartScalar] {
        return [
            this.min(columns),
            this.max(columns)
        ];
    }

    /**
     * Get the sum of the values in a column, or `Array` or `List`, of columns.
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

    sum(columns: $Keys<R> | Array<$Keys<R>>): ?ChartScalar {
        return this._aggregation("sum", sum, columns);
    }

    /**
     * Get the average of the values in a column, or `Array` or `List`, of columns.
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

    average(columns: $Keys<R> | Array<$Keys<R>>): ?ChartScalar {
        return this._aggregation("average", mean, columns);
    }

    /**
     * Get the median of the values in a column, or `Array` or `List`, of columns.
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

    median(columns: $Keys<R> | Array<$Keys<R>>): ?ChartScalar {
        return this._aggregation("median", median, columns);
    }

    /**
     * Get the p quantile of the values in a column (or `Array` or `List` of columns), where p is a
     * number in the range [0, 1]. For example, the median can be computed using p = 0.5, the first
     * quartile at p = 0.25, and the third quartile at p = 0.75. This uses [d3's quantile](https://github.com/d3/d3-array#quantile)
     * method. See [d3's docs](https://github.com/d3/d3-array#quantile) for details.
     *
     * @param {string|Array<string>|List<string>} columns
     * The names of one or more columns to perform the operation on.
     * @param {number} p
     * A number in the range [0,1] where 0.5 is the median.
     *
     * @return {number|null} The quantile of the values, or null if no quantile could be determined.
     *
     * @name quantile
     * @kind function
     * @inner
     * @memberof ChartData
     */

    quantile(columns: $Keys<R> | Array<$Keys<R>>, p: number): ?ChartScalar {
        const columnList = this._columnArgList(columns);
        if(this._columnListError(columnList)) {
            return null;
        }

        const allValuesForColumns = this._memoize(
            `allValuesForColumns.${columnList.join(',')}`,
            () => this._allValuesForColumns(columnList).filter(val => val != null)
        );
        const sortedValues = [...allValuesForColumns].sort(
            (a, b) => typeof a === 'number' && typeof b === 'number' ? a - b : -1
        );
        const quantileValue = quantile(sortedValues, p);
        return typeof quantileValue === 'undefined' ? null : quantileValue;
    }

    /**
     * Get a [five number summary](https://en.wikipedia.org/wiki/Five-number_summary) of the values
     * in a column (or `Array` or `List` of columns).
     * This can be used to render a [box plot](https://en.wikipedia.org/wiki/Box_plot).
     *
     * The summary consists of:
     *
     * - the sample minimum (smallest observation) - `min`
     * - the lower quartile or first quartile - `lowerQuartile`
     * - the median (middle value) - `median`
     * - the upper quartile or third quartile - `upperQuartile`
     * - the sample maximum (largest observation) - `max`
     *
     *
     * @param {string|Array<string>|List<string>} columns
     * The names of one or more columns to perform the operation on.
     *
     * @return {Object|null}
     * An object containing `min`, `lowerQuartile`, `median`, `upperQuartile`, and `max`
     *
     *
     * @name summary
     * @kind function
     * @inner
     * @memberof ChartData
     */

    summary(
        columns: $Keys<R> | Array<$Keys<R>>
    ): ?{
        min: ?ChartScalar,
        lowerQuartile: ?ChartScalar,
        median: ?ChartScalar,
        upperQuartile: ?ChartScalar,
        max: ?ChartScalar
    } {
        const columnList = this._columnArgList(columns);
        if(this._columnListError(columnList)) {
            return null;
        }

        return this._memoize(`summary.${columnList.join(',')}`, () => {
            return {
                min: this.min(columns),
                lowerQuartile: this.quantile(columns, 0.25),
                median: this.median(columns),
                upperQuartile: this.quantile(columns, 0.75),
                max: this.max(columns)
            };
        });
    }

    /**
     * Get the [population variance](https://www.khanacademy.org/math/ap-statistics/quantitative-data-ap/measuring-spread-quantitative/v/variance-of-a-population)
     * of the values in a column, or `Array` or `List`, of columns. This uses [d3's variance method](https://github.com/d3/d3-array#variance).
     *
     * @param {string|Array<string>|List<string>} columns
     * The names of one or more columns to perform the operation on.
     *
     * @return {number|null} The variance of the values, or null if no variance could be determined.
     *
     * @name variance
     * @kind function
     * @inner
     * @memberof ChartData
     */

    variance(columns: $Keys<R> | Array<$Keys<R>>): ?ChartScalar {
        return this._aggregation("variance", variance, columns);
    }

    /**
     * Get the standard deviation of the values in a column, or `Array` or `List`, of columns.
     * This uses [d3's deviation method](https://github.com/d3/d3-array#deviation). The standard
     * deviation is defined as the square root of the variance.
     *
     * @param {string|Array<string>|List<string>} columns
     * The names of one or more columns to perform the operation on.
     *
     * @return {number|null} The deviation of the values, or null if no deviation could be determined.
     *
     * @name deviation
     * @kind function
     * @inner
     * @memberof ChartData
     */

    deviation(columns: $Keys<R> | Array<$Keys<R>>): ?ChartScalar {
        return this._aggregation("deviation", deviation, columns);
    }

    /**
     * Organize the data into [bins](https://en.wikipedia.org/wiki/Data_binning) as defined by the
     * provided `thresholds`. Uses [d3's `histogram`](https://github.com/d3/d3-array#histograms) method.
     *
     * @example
     *
     * const binnedData = data.bin('month', (values, min, max, generators) => {
     *     return generators.freedmanDiaconis(values, min, max);
     * }, null, row => {
     *     return row.map(value => value.reduce((a,b) => a + b, 0));
     * });
     *
     * @param {string} column
     * The column to use for organizing data into bins.
     *
     * @param {Array<ChartScalar>|List<ChartScalar>|number|Function} [thresholds]
     * A List or Array of values or a `count` number or a function that returns a List or Array of
     * values or a `count` number.
     *
     * If thresholds is a number then the data will be organized into that number of uniform bins.
     *
     * Otherwise if thresholds is an Array or list in the form `[x0, x1, …]` - any value less than
     * x0 will be placed in the first bin; any value greater than or equal to x0 but less than x1
     * will be placed in the second bin; and so on. method. If `thresholds` is a function is will be
     * passed 4 parameters and is expected to return an Array or List in the form described above:
     *
     * - `values` An array of values in the specified column
     * - `min` The min of the values in the specified column
     * - `max` The max of the values in the specified column
     * - `generators` An object containing 3 default [threshold generators](https://github.com/d3/d3-array#histogram-thresholds)
     * from d3. See the example for usage details.
     *
     * If no threshold is specifed then [Sturges' forumula](https://en.wikipedia.org/wiki/Histogram#Mathematical_definition)
     * will be used to calculate thresholds.
     *
     * @param {Array<ChartScalar>|List<ChartScalar>} [domain]
     * Specifies the domain to use when creating bins. Any values outside the specified domain will
     * not be placed into bins. Defaults to `[min, max]`.
     *
     * @param {function} [rowMapper]
     * A function that will be called with each bin row _after_ the binning operation. Each row will
     * have all columns except the one specified by the `column` parameter. Each column's value will
     * be a list of all the values that reside within the current bin. This allows you to perform
     * aggregations of your choice on the values. While this function is not required - if it is
     * not specified then the `ChartData` returned from  the bin method will have `null` values for
     * all columns except the column specified by the `column` parameter.
     *
     * @param {function} [columnUpdater]
     * A function that will receive a list of the original `ChartData`'s columns. This allows you to
     * change the labels or types or rename columns before they are passed to the new `ChartData`.
     * The columns List passed to the function will already have new columns added to specify the
     * bounds of the bin. They will be named in the form `${column}Lower` and `${column}Upper`.
     *
     *
     * @return {ChartData} A new ChartData with the rows organised into bins.
     *
     * @name bin
     * @kind function
     * @inner
     * @memberof ChartData
     */

    bin<C: $Keys<R>>(
        column: C,
        thresholds?: BinThreshold | BinThresholdGenerator,
        domain?: [number, number],
        rowMapper?: (row: $ObjMap<R, BinRow>) => $ObjMap<R, BinRow>,
        columnUpdater?: (ChartColumnList<R>) => ChartColumnList<R>
    ): ?ChartData<{[key: string]: ChartScalar}> {
        if(this._columnError(column)) {
            return null;
        }

        const allValues = this._memoize(
            `allValuesForColumns.${column}`,
            () => this._allValuesForColumns([column]).filter(val => val != null)
        );

        const isDate = ChartData.isValueDate(allValues[0]);

        const min = this.min(column);
        const max = this.max(column);


        const calculatedThresholds = typeof thresholds === 'function'
            ? thresholds(allValues, min, max, {
                freedmanDiaconis: thresholdFreedmanDiaconis,
                scott: thresholdScott,
                sturges: thresholdSturges
            })
            : null;

        // Calculate thresholds for binning
        const binThresholds = thresholds == null
            ? thresholdSturges(allValues)
            : calculatedThresholds
                ? calculatedThresholds
                : thresholds;

        const binDomain = domain == null
            ? [min, max]
            : domain;

        const bins: Array<Array<R> & {x0: number | Date, x1: number | Date}> = histogram()
            .thresholds(binThresholds)
            .domain(binDomain)(allValues);

        // Use d3-histogram generated bins to organize ChartData rows into bins
        const groupedRowsMap = fastGroupByToMap(this.rows, (row: R): ?number => {
            const preBinnedValue = row[column];
            // bins is plain js so can't use findIndex here
            return bins.reduce((
                matchedIndex: ?number,
                bin: Array<R>,
                binIndex: number
            ): ?number => {
                if(typeof matchedIndex === 'number') return matchedIndex;
                return bin.indexOf(preBinnedValue) !== -1 ? binIndex : matchedIndex;
            }, null);
        });

        let groupedRows: Array<{binIndex: number, binRows: Array<R>}> = [];
        for(let entry of groupedRowsMap.entries()) {
            const [binIndex, binRows] = entry;
            if(binIndex == null) continue;
            groupedRows.push({binIndex, binRows});
        }


        const binnedRows = groupedRows
            .sort((rowA, rowB) => {
                return rowA.binIndex - rowB.binIndex;
            })
            .map(({binRows}: {binIndex: number, binRows: Array<R>}): $ObjMap<R, BinRow> => {
                // Generate blank starting row map with bin column nulled
                const columns: Array<$Keys<R>> = Object.keys(binRows[0]);

                const blankRow = columns.reduce((
                    row: $ObjMap<R, BinRow>,
                    rowColumn: string
                ) => {
                    return {
                        ...row,
                        [rowColumn]: rowColumn === column ? null : []
                    };
                }, ({}: $ObjMap<R, BinRow>));

                return binRows
                    .reduce((
                        aggRow: $ObjMap<R, BinRow>,
                        row: R
                    ): $ObjMap<R, BinRow> => {
                        const columns: Array<$Keys<R>> = Object.keys(row);

                        return columns.reduce((mergedRow, rowColumn) => {
                            return {
                                ...mergedRow,
                                [rowColumn]: (mergedRow[rowColumn] || []).concat(row[rowColumn])
                            };
                        }, aggRow);
                    }, (blankRow));
            });


        // Run binned rows through provided rowMapper then add Lower and Upper values.
        const rows = binnedRows
            .map(rowMapper || (() => {}))
            .map((row, binIndex) => ({
                ...row,
                [`${column}Lower`]: isDate ? new Date(bins[binIndex].x0) : bins[binIndex].x0,
                [`${column}Upper`]: isDate ? new Date(bins[binIndex].x1) : bins[binIndex].x1
            }));

        // Add upper and lower columns but maintain index
        let newColumns = [...this.columns];
        const columnIndex = this.columns.findIndex(columnName => columnName === column);
        const columnToReplace = this.columns[columnIndex];

        newColumns.splice(columnIndex, 1, {...columnToReplace, key: `${column}Lower`});
        newColumns.splice(columnIndex + 1, 0, {...columnToReplace, key: `${column}Upper`});

        const columns = columnUpdater
            ? columnUpdater(newColumns.map(({key, label, isContinuous}) => ({key, label, isContinuous})))
            : newColumns;

        return new ChartData(rows, columns.map(({key, label, isContinuous}) => ({key, label, isContinuous})));
    }
}

export default ChartData;
