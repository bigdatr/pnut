import test from 'ava';
import {is, List} from 'immutable';
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

// memoization

test('Calling a memoized method should return the same object if called a second time', tt => {
    const data = new ChartData(rows, columns);
    tt.true(data.getColumnData('fruit') === data.getColumnData('fruit'));
});

// min

test('ChartData.min should return the minimum value for a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.min('supply'), 12);
});

test('ChartData.min should return the minimum value for a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.min('supply'), 32);
});

test('ChartData.min should return null when there are no values to compare', tt => {
    const data = new ChartData(allNulls, columns);
    tt.is(data.min('supply'), null);
});

test('ChartData.min should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    data.min('demand');
    tt.is(data.min('supply'), 12);
});

test('ChartData.min should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.min('not here'), null);
});

// max

test('ChartData.max should return the maximum value for a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.max('day'), 19);
});

test('ChartData.max should return the maximum value for a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.max('supply'), 34);
});

test('ChartData.max should return null when there are no values to compare', tt => {
    const data = new ChartData(allNulls, columns);
    tt.is(data.max('supply'), null);
});

test('ChartData.max should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    data.max('demand');
    tt.is(data.max('day'), 19);
});

test('ChartData.max should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.max('not here'), null);
});

// sum

test('ChartData.sum should return the sum of values of a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.sum('demand'), 302);
});

test('ChartData.sum should return the sum of values of a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.sum('demand'), 77 + 88 + 99);
});

test('ChartData.sum should return zero when there are no values to compare', tt => {
    const data = new ChartData(allNulls, columns);
    tt.is(data.sum('supply'), 0);
});

test('ChartData.sum should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    data.sum('supply');
    tt.is(data.sum('demand'), 302);
});

test('ChartData.sum should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.sum('not here'), null);
});

// average

test('ChartData.average should return the average of values of a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.average('supply'), 22.6);
});

test('ChartData.average should return the average of values of a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.average('supply'), 33);
});

test('ChartData.average should return null when there are no values to compare', tt => {
    const data = new ChartData(allNulls, columns);
    tt.is(data.average('supply'), null);
});

test('ChartData.average should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    data.average('demand');
    tt.is(data.average('supply'), 22.6);
});

test('ChartData.average should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.average('not here'), null);
});

// median

test('ChartData.median should return the median of values of a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.median('demand'), 56);
});

test('ChartData.median should return the median of values of a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.median('demand'), 88);
});

test('ChartData.median should return null when there are no values to compare', tt => {
    const data = new ChartData(allNulls, columns);
    tt.is(data.median('supply'), null);
});

test('ChartData.median should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    data.median('supply');
    tt.is(data.median('demand'), 56);
});

test('ChartData.median should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.median('not here'), null);
});
