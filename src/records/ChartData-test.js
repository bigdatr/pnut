import test from 'ava';
import {fromJS, is, List} from 'immutable';
import ChartData from './ChartData';

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
// static
//

test('ChartData correctly identifies valid values', tt => {
    tt.true(ChartData.isValueValid(23), 'number is valid');
    tt.true(ChartData.isValueValid(-123.234), 'negative number is valid');
    tt.true(ChartData.isValueValid(0), 'zero number is valid');
    tt.true(ChartData.isValueValid("23"), 'string is valid');
    tt.true(ChartData.isValueValid(""), 'empty string is valid');
    tt.true(ChartData.isValueValid(null), 'null is valid');
    tt.false(ChartData.isValueValid(false), 'boolean (true) is not valid');
    tt.false(ChartData.isValueValid(true), 'boolean (false) is not valid');
    tt.false(ChartData.isValueValid(undefined), 'undefined is not valid');
    tt.false(ChartData.isValueValid({}), 'object is not valid');
    tt.false(ChartData.isValueValid(() => {}), 'function is not valid');
});

test('ChartData correctly identifies continuous values', tt => {
    tt.true(ChartData.isValueContinuous(23), 'number is continuous');
    tt.true(ChartData.isValueContinuous(-123.234), 'negative number is continuous');
    tt.true(ChartData.isValueContinuous(0), 'zero number is continuous');
    tt.false(ChartData.isValueContinuous("23"), 'string is not continuous');
    tt.false(ChartData.isValueContinuous(""), 'empty string is not continuous');
    tt.false(ChartData.isValueContinuous(null), 'null is not continuous');
    tt.false(ChartData.isValueContinuous(false), 'boolean (true) is not continuous');
    tt.false(ChartData.isValueContinuous(true), 'boolean (false) is not continuous');
    tt.false(ChartData.isValueContinuous(undefined), 'undefined is not continuous');
    tt.false(ChartData.isValueContinuous({}), 'object is not continuous');
    tt.false(ChartData.isValueContinuous(() => {}), 'function is not continuous');
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

test('ChartData Record should be able to take an OrderedMap of ChartColumns as columns', tt => {
    const data = new ChartData(rows, fromJS(columns));
    const dataAgain = new ChartData(rows, data.columns);
    tt.deepEqual(dataAgain.columns.toList().map(ii => ii.key), fromJS(columns).map(ii => ii.get('key')));
    tt.deepEqual(dataAgain.columns.toList().map(ii => ii.label), fromJS(columns).map(ii => ii.get('label')));
    tt.deepEqual(dataAgain.columns.toList().map(ii => ii.isContinuous), fromJS(columns).map(ii => ii.get('isContinuous')));
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

//
//  frames
//

const frameableRows = [
    {
        day: 1,
        fruit: "apple",
        amount: 3
    },
    {
        day: 1,
        fruit: "banana",
        amount: 4
    },
    {
        day: 1,
        fruit: "fudge",
        amount: 5
    },
    {
        day: 2,
        fruit: "apple",
        amount: 2
    },
    {
        day: 2,
        fruit: "banana",
        amount: 5
    },
    {
        day: 2,
        fruit: "fudge",
        amount: 5
    },
    {
        day: 3,
        fruit: "apple",
        amount: 0
    },
    {
        day: 3,
        fruit: "banana",
        amount: 4
    },
    {
        day: 3,
        fruit: "fudge",
        amount: 100
    }
];

const framesAnswer = fromJS([
    [
        {
            day: 1,
            fruit: "apple",
            amount: 3
        },
        {
            day: 1,
            fruit: "banana",
            amount: 4
        },
        {
            day: 1,
            fruit: "fudge",
            amount: 5
        }
    ],
    [
        {
            day: 2,
            fruit: "apple",
            amount: 2
        },
        {
            day: 2,
            fruit: "banana",
            amount: 5
        },
        {
            day: 2,
            fruit: "fudge",
            amount: 5
        }
    ],
    [
        {
            day: 3,
            fruit: "apple",
            amount: 0
        },
        {
            day: 3,
            fruit: "banana",
            amount: 4
        },
        {
            day: 3,
            fruit: "fudge",
            amount: 100
        }
    ]
]);

// makeFrames


test('ChartData.makeFrames should return a List of chart rows grouped by frameColumn', tt => {
    const data = new ChartData(frameableRows, columns);
    tt.true(is(
        data.makeFrames('day'),
        framesAnswer
    ));
});

test('ChartData.makeFrames should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(frameableRows, columns);
    tt.is(data.makeFrames('not here'), null);
});

test('ChartData.makeFrames should use memoization', tt => {
    const data = new ChartData(frameableRows, columns);
    tt.true(data.makeFrames('fruit') === data.makeFrames('fruit'));
});

test('ChartData.makeFrames should memoize per column', tt => {
    const data = new ChartData(frameableRows, columns);
    data.makeFrames('amount');
    tt.deepEqual(data.makeFrames('day'), framesAnswer);
});


// frameAtIndex


test('ChartData.frameAtIndex should return a ChartData containing data at an existing frame when passed an integer', tt => {
    const data = new ChartData(frameableRows, columns);
    tt.true(is(
        data.frameAtIndex('day', 1).rows,
        fromJS(frameableRows).filter(ii => ii.get('day') == 2)
    ));
});

test('ChartData.frameAtIndex should return null if passed an incorrect index', tt => {
    const data = new ChartData(frameableRows, columns);
    tt.is(data.frameAtIndex('day', -1), null);
    tt.is(data.frameAtIndex('day', 3), null);
    tt.is(data.frameAtIndex('day', 2.3), null);
});

test('ChartData.frameAtIndex should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(frameableRows, columns);
    tt.is(data.frameAtIndex('not here'), null);
});

test('ChartData.frameAtIndex should use memoization', tt => {
    const data = new ChartData(frameableRows, columns);
    tt.true(data.frameAtIndex('fruit', 0) === data.frameAtIndex('fruit', 0));
});

test('ChartData.frameAtIndex should memoize per column', tt => {
    const data = new ChartData(frameableRows, columns);
    const answer = fromJS([
        {
            day: 1,
            fruit: "apple",
            amount: 3
        },
        {
            day: 1,
            fruit: "banana",
            amount: 4
        },
        {
            day: 1,
            fruit: "fudge",
            amount: 5
        }
    ]);
    data.frameAtIndex('amount', 0);
    tt.deepEqual(data.frameAtIndex('day', 0).rows, answer);
});

test('ChartData.frameAtIndex should memoize per index', tt => {
    const data = new ChartData(frameableRows, columns);
    const answer = fromJS([
        {
            day: 1,
            fruit: "apple",
            amount: 3
        },
        {
            day: 1,
            fruit: "banana",
            amount: 4
        },
        {
            day: 1,
            fruit: "fudge",
            amount: 5
        }
    ]);
    data.frameAtIndex('day', 1);
    tt.deepEqual(data.frameAtIndex('day', 0).rows, answer);
});



// frameAtIndexIntepolated

test('ChartData.frameAtIndexInterpolated should return a ChartData containing data at an existing frame when passed an integer', tt => {
    const data = new ChartData(frameableRows, columns);

    tt.true(is(
        data.frameAtIndexInterpolated('day', 'fruit', 1).rows,
        fromJS(frameableRows).filter(ii => ii.get('day') == 2)
    ));
});

test('ChartData.frameAtIndexInterpolated should return a ChartData containing interpolated data when passed an non-integer', tt => {
    const data = new ChartData(frameableRows, columns);
    const answer = fromJS([
        {
            day: 2,
            fruit: "apple",
            amount: 2
        },
        {
            day: 2,
            fruit: "banana",
            amount: 5
        },
        {
            day: 2,
            fruit: "fudge",
            amount: 5
        },
        {
            day: 3,
            fruit: "apple",
            amount: 0
        },
        {
            day: 3,
            fruit: "banana",
            amount: 4
        },
        {
            day: 3,
            fruit: "fudge",
            amount: 100
        }
    ]);

    tt.true(is(
        data.frameAtIndexInterpolated('day', 'fruit', 1.5)/*.rows*/,
        answer
    ));
});


test('ChartData.frameAtIndexInterpolated should return null if passed an incorrect index', tt => {
    const data = new ChartData(frameableRows, columns);
    tt.is(data.frameAtIndexInterpolated('day', 'fruit', -1), null);
    tt.is(data.frameAtIndexInterpolated('day', 'fruit', 3), null);
    tt.is(data.frameAtIndexInterpolated('day', 'fruit', 2.3), null);
});

test('ChartData.frameAtIndexInterpolated should return null when provided invalid columns or column combinations', tt => {
    const data = new ChartData(frameableRows, columns);
    tt.is(data.frameAtIndexInterpolated('not here', 'fruit'), null);
    tt.is(data.frameAtIndexInterpolated('day', 'not here'), null);
    tt.is(data.frameAtIndexInterpolated('day', 'day'), null);
});


