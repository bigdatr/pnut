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
     */
    static isValueContinuous(value: ChartScalar): boolean {
        return typeof value === "number" || ChartData.isValueDate(value);
    }

    /**
     * Check if the value is a date and that the date is not invalid.
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
     */
    get rows(): Array<R> {
        return this._rows;
    }

    /**
     * An `Array` containing this `ChartData`'s column definitions, which are each
     * of type `ChartColumn`.
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
     */
    updateRows(updater: (Array<R>) => Array<R>): ChartData<R> {
        return new ChartData(
            updater(this.rows),
            this.columns.map(({key, label, isContinuous}) => ({key, label, isContinuous}))
        );
    }

    /**
     * Returns a new `ChartData` with updated `columns`.
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
     */
    mapRows(mapper: (R) => R): ChartData<R> {
        return new ChartData(
            this.rows.map(mapper),
            this.columns.map(({key, label, isContinuous}) => ({key, label, isContinuous}))
        );
    }

    /**
     * Returns all the data in a single column.
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
     */
    min(columns: $Keys<R> | Array<$Keys<R>>): ?ChartScalar {
        return this._aggregation("min", min, columns);
    }

    /**
     * Get the maximum value in a column, or `Array` or `List`, of columns.
     */
    max(columns: $Keys<R> | Array<$Keys<R>>): ?ChartScalar {
        return this._aggregation("max", max, columns);
    }

    /**
     * Gets the minimum and maximum non-null value in a column, or `Array` or `List`, of columns,
     * returned as an array of `[min, max]`.
     */
    extent(columns: $Keys<R> | Array<$Keys<R>>): [?ChartScalar, ?ChartScalar] {
        return [
            this.min(columns),
            this.max(columns)
        ];
    }

    /**
     * Get the sum of the values in a column, or `Array` or `List`, of columns.
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
     */
    median(columns: $Keys<R> | Array<$Keys<R>>): ?ChartScalar {
        return this._aggregation("median", median, columns);
    }

    /**
     * Get the p quantile of the values in a column (or `Array` or `List` of columns), where p is a
     * number in the range [0, 1]. For example, the median can be computed using p = 0.5, the first
     * quartile at p = 0.25, and the third quartile at p = 0.75. This uses [d3's quantile](https://github.com/d3/d3-array#quantile)
     * method. See [d3's docs](https://github.com/d3/d3-array#quantile) for details.
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
