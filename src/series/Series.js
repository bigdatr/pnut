// @flow
import groupBy from 'unmutable/groupBy';
import sortBy from 'unmutable/sortBy';
import pipeWith from 'unmutable/pipeWith';
import map from 'unmutable/map';
import toArray from 'unmutable/toArray';
import get from 'unmutable/get';
import getIn from 'unmutable/getIn';

type SeriesConfig<A> = {
    rows: Array<Array<A>>,
    rawData: Array<A>,
    type: string,
    rowKey: string,
    columnKey: string,
    preprocess: Object
};

export default class Series<A> {
    constructor(config: SeriesConfig<A>) {
        this.rawData = config.rawData;
        this.rows = config.rows;
        this.type = config.type;
        this.rowKey = config.rowKey;
        this.columnKey = config.columnKey;
        this.preprocess = config.preprocess || {};
    }

    static of(config: SeriesConfig<A>): Series<A> {
        return new Series(config);
    }

    static group(rowKey: string, columnKey: string, rawData: A[][]): Series<A> {
        const baseRow = new Map();

        rawData.forEach(item => {
            const columnValue = get(columnKey)(item);
            baseRow.set(String(columnValue), {[columnKey]: columnValue});
        });

        const rows = pipeWith(
            [...rawData],
            groupBy(get(rowKey)),
            toArray(),
            map(row => {
                const newRowMap = row.reduce((map, item) => {
                    return map.set(String(get(columnKey)(item)), item);
                }, new Map(baseRow));

                return [...newRowMap.values()];
            })
        );

        return Series.of({
            type: 'grouped',
            rowKey,
            columnKey,
            rawData,
            rows
        });
    }

    copy() {
        return new Series({...this});
    }

    update<B>(fn: Function): Series<B> {
        return Series.of(fn(this));
    }

    get(rowIndex: number, columnIndex: number): A {
        return getIn([rowIndex, columnIndex])(this.rows);
    }

    mapRows<B>(fn: (A) => B): Series<B> {
        this.rows = this.rows.map(fn);
        return this.copy();
    }

    getRow(index: number): A[] {
        return this.data[index];
    }

    mapColumns<B>(fn: (A) => B): Series<B> {
        for (let c = 0; c < this.rows[0].length; c++) {
            let column = fn(this.getColumn(c), c);
            for (let r = 0; r < this.rows.length; r++) {
                this.rows[r][c] = column[r];
            }
        }

        return this.copy();
    }

    getColumn(index: number): A[] {
        return this.rows.map(row => row[index]);
    }

}
