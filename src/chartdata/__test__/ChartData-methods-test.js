import test from 'ava';
import {is, List, fromJS} from 'immutable';
import ChartData from '../ChartData';

// dont show console errors
console.error = () => {};

const rows = [
    {
        day: 1,
        supply: 34,
        demand: 99,
        fruit: "apple"
    },
    {
        day: 2,
        supply: 32,
        demand: 88,
        fruit: "apple"
    },
    {
        day: 3,
        supply: 13,
        demand: 55,
        fruit: "orange"
    },
    {
        day: 8,
        supply: 22,
        demand: 56,
        fruit: "peach"
    },
    {
        day: 19,
        supply:  12,
        demand:  4,
        fruit: "pear"
    }
];

const rowsWithNulls = [
    {
        day: 1,
        supply: null,
        demand: 99,
        fruit: "apple"
    },
    {
        day: 2,
        supply: 32,
        demand: 88,
        fruit: "apple"
    },
    {
        day: 3,
        supply: 34,
        demand: null,
        fruit: "orange"
    },
    {
        day: 3,
        supply: null,
        demand: 77,
        fruit: "peach"
    }
];

const allNulls = [
    {
        day: 1,
        supply: null,
        demand: null,
        fruit: "apple"
    }
];

const columns = [
    {
        key: 'day',
        label: 'Day',
        isContinuous: true
    },
    {
        key: 'supply',
        label: 'Supply (houses)',
        isContinuous: true
    },
    {
        key: 'demand',
        label: 'Demand (houses)',
        isContinuous: true
    },
    {
        key: 'fruit',
        label: 'Random fruit',
        isContinuous: false
    }
];

//
// methods
//

// updateRows

test('ChartData.updateRows should return an updated ChartData', tt => {
    const data = new ChartData(rows, columns);
    const answer = fromJS([
        {
            day: 1,
            supply: 34,
            demand: 99,
            fruit: "no fruit"
        },
        {
            day: 2,
            supply: 32,
            demand: 88,
            fruit: "no fruit"
        },
        {
            day: 3,
            supply: 13,
            demand: 55,
            fruit: "no fruit"
        },
        {
            day: 8,
            supply: 22,
            demand: 56,
            fruit: "no fruit"
        },
        {
            day: 19,
            supply:  12,
            demand:  4,
            fruit: "no fruit"
        }
    ]);

    const newData = data.updateRows(rows => {
        return rows.map(row => row.set('fruit', 'no fruit'))
    });
    tt.deepEqual(newData.rows, answer);
});

test('ChartData.updateRows should retain columns', tt => {
    const data = new ChartData(rows, columns);
    const newData = data.updateRows(rows => {
        return rows.map(row => row.set('fruit', 'no fruit'))
    });
    tt.deepEqual(newData.columns, data.columns);
});

// mapRows

test('ChartData.mapRows should return an updated ChartData', tt => {
    const data = new ChartData(rows, columns);
    const answer = fromJS([
        {
            day: 1,
            supply: 134,
            demand: 199,
            fruit: "apple"
        },
        {
            day: 2,
            supply: 132,
            demand: 188,
            fruit: "apple"
        },
        {
            day: 3,
            supply: 113,
            demand: 155,
            fruit: "orange"
        },
        {
            day: 8,
            supply: 122,
            demand: 156,
            fruit: "peach"
        },
        {
            day: 19,
            supply:  112,
            demand:  104,
            fruit: "pear"
        }
    ]);

    const newData = data.mapRows(row => row
        .update('supply', n => n + 100)
        .update('demand', n => n + 100)
    );
    tt.deepEqual(newData.rows, answer);
});

test('ChartData.mapRows should retain columns', tt => {
    const data = new ChartData(rows, columns);
    const newData = data.mapRows(row => row.set('fruit', 'no fruit'));
    tt.deepEqual(newData.columns, data.columns);
});

// getColumnData

test('ChartData.getColumnData should return a List of data in a column', tt => {
    const data = new ChartData(rows, columns);
    tt.deepEqual(data.getColumnData('fruit'), List(["apple", "apple", "orange", "peach", "pear"]));
});

test('ChartData.getColumnData should return null if given a column name that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.getColumnData('not here'), null);
});

test('ChartData.getColumnData should use memoization', tt => {
    const data = new ChartData(rows, columns);
    tt.true(data.getColumnData('fruit') === data.getColumnData('fruit'));
});

test('ChartData.getColumnData should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    data.getColumnData('demand');
    tt.deepEqual(data.getColumnData('fruit'), List(["apple", "apple", "orange", "peach", "pear"]));
});

// getUniqueValues

test('ChartData.getUniqueValues should return a list of unique values from a column', tt => {
    const data = new ChartData(rows, columns);
    tt.true(is(
        data.getUniqueValues('fruit'),
        List(["apple", "orange", "peach", "pear"])
    ));
});

test('ChartData.getUniqueValues should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.getUniqueValues('not here'), null);
});

test('ChartData.getUniqueValues should use memoization', tt => {
    const data = new ChartData(rows, columns);
    tt.true(data.getUniqueValues('fruit') === data.getUniqueValues('fruit'));
});

test('ChartData.getUniqueValues should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    data.getUniqueValues('demand');
    tt.deepEqual(data.getUniqueValues('fruit'), List(["apple", "orange", "peach", "pear"]));
});
