import test from 'ava';
import {fromJS, List} from 'immutable';
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

const rowsWithDates = [
    {
        day: new Date("2016-01-30"),
        hats: 12
    },
    {
        day: new Date("2016-01-31"),
        hats: 3
    },
    {
        day: new Date("2016-02-01"),
        hats: 7
    },
    {
        day: new Date("2016-02-02"),
        hats: 8
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
// empty
//

test('ChartData Record can be created with nothing passed in', tt => {
    const data = new ChartData();
    tt.is(data.rows.size, 0);
    tt.is(data.columns.size, 0);
});

test('ChartData Record can be created with only rows passed in', tt => {
    const data = new ChartData(rows);
    tt.deepEqual(data.rows, fromJS(rows));
    tt.is(data.columns.size, 0);
});

//
// rows
//

test('ChartData Record can be created with rows', tt => {
    const data = new ChartData(rows, columns);
    tt.deepEqual(data.rows, fromJS(rows));
});

test('ChartData contents can take immutable rows', tt => {
    const data = new ChartData(fromJS(rows), columns);
    tt.deepEqual(data.rows, fromJS(rows));
});

test('ChartData converts all invalid values to null', tt => {
    const rowsWithBadData = [
        {
            supply: null,
            demand: undefined,
            fruit: "apple"
        },
        {
            supply: 32,
            demand: 88,
            fruit: false
        },
        {
            supply: {foo: "bar"},
            demand: () => {},
            fruit: "orange"
        }
    ];

    const rowsWithBadDataExpectedOutput = [
        {
            supply: null,
            demand: null,
            fruit: "apple"
        },
        {
            supply: 32,
            demand: 88,
            fruit: null
        },
        {
            supply: null,
            demand: null,
            fruit: "orange"
        }
    ];

    const data = new ChartData(rowsWithBadData, columns);
    tt.deepEqual(data.rows, fromJS(rowsWithBadDataExpectedOutput));
});

test('ChartData Record can create rows with date values', tt => {
    const data = new ChartData(rowsWithDates, columns);
    tt.deepEqual(data.rows, fromJS(rowsWithDates));
});


//
// columns
//

test('ChartData Record should be able to be created with columns', tt => {
    const data = new ChartData(rows, columns);
    tt.deepEqual(data.columns.toList().map(ii => ii.key), fromJS(columns).map(ii => ii.get('key')));
    tt.deepEqual(data.columns.toList().map(ii => ii.label), fromJS(columns).map(ii => ii.get('label')));
    tt.deepEqual(data.columns.toList().map(ii => ii.isContinuous), fromJS(columns).map(ii => ii.get('isContinuous')));
});

test('ChartData Record should be able to take immutable columns', tt => {
    const data = new ChartData(rows, fromJS(columns));
    tt.deepEqual(data.columns.toList().map(ii => ii.key), fromJS(columns).map(ii => ii.get('key')));
    tt.deepEqual(data.columns.toList().map(ii => ii.label), fromJS(columns).map(ii => ii.get('label')));
    tt.deepEqual(data.columns.toList().map(ii => ii.isContinuous), fromJS(columns).map(ii => ii.get('isContinuous')));
});

test('ChartData Record should be able to take columns which are a List of objects', tt => {
    const data = new ChartData(rows, List(columns));
    tt.deepEqual(data.columns.toList().map(ii => ii.key), fromJS(columns).map(ii => ii.get('key')));
    tt.deepEqual(data.columns.toList().map(ii => ii.label), fromJS(columns).map(ii => ii.get('label')));
    tt.deepEqual(data.columns.toList().map(ii => ii.isContinuous), fromJS(columns).map(ii => ii.get('isContinuous')));
});

test('ChartData Record should be able to take an OrderedMap of ChartColumns as columns', tt => {
    const data = new ChartData(rows, fromJS(columns));
    const dataAgain = new ChartData(rows, data.columns);
    tt.deepEqual(dataAgain.columns.toList().map(ii => ii.key), fromJS(columns).map(ii => ii.get('key')));
    tt.deepEqual(dataAgain.columns.toList().map(ii => ii.label), fromJS(columns).map(ii => ii.get('label')));
    tt.deepEqual(dataAgain.columns.toList().map(ii => ii.isContinuous), fromJS(columns).map(ii => ii.get('isContinuous')));
});

test('ChartData should use column.isContinuous = true (when provided) to specify when a column contains continuous data', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.true(data.columns.get('day').isContinuous, 'column data is continuous if isContinuous is true');
});

test('ChartData should use column.isContinuous = false (when provided) to specify when a column doesnt contain continuous data', tt => {
    const data = new ChartData(rowsWithNulls, fromJS(columns).update(0, ii => ii.set('isContinuous', false)));
    tt.false(data.columns.get('day').isContinuous, 'column data is continuous if isContinuous is false');
});

test('ChartData should automatically determine if a column is continuous', tt => {
    const columnsWithoutContinuous = fromJS(columns).map(col => col.delete('isContinuous'));
    const data = new ChartData(rowsWithNulls, columnsWithoutContinuous);

    tt.true(data.columns.get('day').isContinuous, 'column data is continuous if first item is a number');
    tt.true(data.columns.get('supply').isContinuous, 'column data is continuous if first non-null item is a number');
});

test('ChartData should automatically determine if a column is not continuous', tt => {
    const columnsWithoutContinuous = fromJS(columns).map(col => col.delete('isContinuous'));
    const data = new ChartData(rowsWithNulls, columnsWithoutContinuous);

    tt.false(data.columns.get('fruit').isContinuous, 'column data is not continuous if first non-null item is not a number');
});
