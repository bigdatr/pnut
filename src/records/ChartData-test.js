import test from 'ava';
import {fromJS, is} from 'immutable';
import ChartData from './ChartData';

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
        supply: null,
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

const columns = [
    {
        key: 'day',
        label: 'Day'
    },
    {
        key: 'supply',
        label: 'Supply (houses)'
    },
    {
        key: 'demand',
        label: 'Demand (houses)'
    },
    {
        key: 'fruit',
        label: 'Random fruit'
    }
];

//
// constructor
//

test('ChartData Record can be created', tt => {
    const data = new ChartData(rows, columns);
    tt.true(is(data.rows, fromJS(rows)), 'rows are set correctly');
    tt.true(is(data.columns, fromJS(columns)), 'columns are set correctly');
});

test('ChartData contents can take immutable rows and columns', tt => {
    const data = new ChartData(fromJS(rows), fromJS(columns));
    tt.true(is(data.rows, fromJS(rows)), 'rows are set correctly');
    tt.true(is(data.columns, fromJS(columns)), 'columns are set correctly');
});

//
// methods
//

// min

test('ChartData.min returns the minimum value for a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.min('supply'), 12, 'minimum value of a column is returned');
});

test('ChartData.min returns the minimum value for a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.min('supply'), 32, 'minimum value of a column is returned');
});

// max

test('ChartData.max returns the maximum value for a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.max('day'), 19, 'maximum value of a column is returned');
});

test('ChartData.max returns the maximum value for a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.max('supply'), 34, 'maximum value of a column is returned');
});

// sum

test('ChartData.sum returns the sum of values of a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.sum('demand'), 302, 'sum of values of a column is returned');
});

test('ChartData.sum returns the sum of values of a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.sum('demand'), 77 + 88 + 99, 'sum of values of a column is returned');
});

// average

test('ChartData.average returns the average of values of a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.average('supply'), 22.6, 'average of values of a column is returned');
});

test('ChartData.average returns the average of values of a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.average('supply'), 33, 'average of values of a column is returned');
});

// median

test('ChartData.median returns the median of values of a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.median('demand'), 56, 'median of values of a column is returned');
});

test('ChartData.median returns the median of values of a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.median('demand'), 88, 'median of values of a column is returned');
});


