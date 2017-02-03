import test from 'ava';
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

const columnsMonths = [
    {
        key: 'supply',
        label: 'Supply',
        isContinuous: true
    },
    {
        key: 'demand',
        label: 'Demand',
        isContinuous: true
    },
    {
        key: 'month',
        label: 'Month',
        isContinuous: false
    }
];
const rowsMonths = [
    {
        month: "2014-01-01",
        supply: 123605,
        demand: 28
    },
    {
        month: "2014-02-01",
        supply: 457959,
        demand: 72
    },
    {
        month: "2014-03-01",
        supply: 543558,
        demand: 96
    },
    {
        month: "2016-10-01",
        supply: 1810362,
        demand: 227
    },
    {
        month: "2016-11-01",
        supply: 1877047,
        demand: 247
    },
    {
        month: "2016-12-01",
        supply: 770154,
        demand: 204
    }
];

// min

test('ChartData.min should return the minimum value for a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.min('supply'), 12);
});

test('ChartData.min should return the minimum value for multiple columns', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.min(['supply', 'demand']), 4);
});

test('ChartData.min should return the minimum value for a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.min('supply'), 32);
});

test('ChartData.min should return the minimum value for a column, even with strings', tt => {
    const data = new ChartData(rowsMonths, columnsMonths);
    tt.is(data.min('month'), "2014-01-01");
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

test('ChartData.max should return the maximum value for multiple columns', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.max(['supply', 'demand']), 99);
});


test('ChartData.max should return the maximum value for a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.max('supply'), 34);
});

test('ChartData.max should return the maximum value for a column, even with strings', tt => {
    const data = new ChartData(rowsMonths, columnsMonths);
    tt.is(data.max('month'), "2016-12-01");
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

test('ChartData.sum should return the sum of values for multiple columns', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.sum(['supply', 'demand']), 415);
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

test('ChartData.average should return the average of values for multiple columns', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.average(['supply', 'demand']), 41.5);
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

test('ChartData.median should return the median of values for multiple columns', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.median(['supply', 'demand']), 33);
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
