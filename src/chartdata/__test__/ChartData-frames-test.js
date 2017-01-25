import test from 'ava';
import {fromJS, is} from 'immutable';
import ChartData from '../ChartData';

// dont show console errors or warns
console.error = () => {};
console.warn = () => {};

const columns = [
    {
        key: 'day',
        label: 'Day'
    },
    {
        key: 'fruit',
        label: 'Fruit'
    },
    {
        key: 'amount',
        label: 'Amount'
    },
    {
        key: 'color',
        label: 'Color'
    }
];

//
//  frames
//

const frameableRows = [
    {
        day: 1,
        fruit: "apple",
        amount: 3,
        color: "blue"
    },
    {
        day: 1,
        fruit: "banana",
        amount: 4,
        color: "blue"
    },
    {
        day: 1,
        fruit: "fudge",
        amount: 5,
        color: "blue"
    },
    {
        day: 2,
        fruit: "apple",
        amount: 2,
        color: "green"
    },
    {
        day: 2,
        fruit: "banana",
        amount: 5,
        color: "green"
    },
    {
        day: 2,
        fruit: "fudge",
        amount: 5,
        color: "green"
    },
    {
        day: 3,
        fruit: "apple",
        amount: 0,
        color: "yellow"
    },
    /*{ intentially missing data point
        day: 3,
        fruit: "banana",
        amount: 4,
        color: "yellow"
    },*/
    {
        day: 3,
        fruit: "fudge",
        amount: 100,
        color: "yellow"
    }
];

const framesAnswer = fromJS([
    [
        {
            day: 1,
            fruit: "apple",
            amount: 3,
            color: "blue"
        },
        {
            day: 1,
            fruit: "banana",
            amount: 4,
            color: "blue"
        },
        {
            day: 1,
            fruit: "fudge",
            amount: 5,
            color: "blue"
        }
    ],
    [
        {
            day: 2,
            fruit: "apple",
            amount: 2,
            color: "green"
        },
        {
            day: 2,
            fruit: "banana",
            amount: 5,
            color: "green"
        },
        {
            day: 2,
            fruit: "fudge",
            amount: 5,
            color: "green"
        }
    ],
    [
        {
            day: 3,
            fruit: "apple",
            amount: 0,
            color: "yellow"
        },
        {
            day: 3,
            fruit: "fudge",
            amount: 100,
            color: "yellow"
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
            amount: 3,
            color: "blue"
        },
        {
            day: 1,
            fruit: "banana",
            amount: 4,
            color: "blue"
        },
        {
            day: 1,
            fruit: "fudge",
            amount: 5,
            color: "blue"
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
            amount: 3,
            color: "blue"
        },
        {
            day: 1,
            fruit: "banana",
            amount: 4,
            color: "blue"
        },
        {
            day: 1,
            fruit: "fudge",
            amount: 5,
            color: "blue"
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

test('ChartData.frameAtIndexInterpolated should return a ChartData containing interpolated data when passed an non-integer (lerping numbers and strings)', tt => {
    const data = new ChartData(frameableRows, columns);
    const answer = fromJS([
        {
            day: 1.5,
            fruit: "apple",
            amount: 2.5,
            color: "blue"
        },
        {
            day: 1.5,
            fruit: "banana",
            amount: 4.5,
            color: "blue"
        },
        {
            day: 1.5,
            fruit: "fudge",
            amount: 5,
            color: "blue"
        }
    ]);

    tt.true(is(
        data.frameAtIndexInterpolated('day', 'fruit', 0.5).rows,
        answer
    ));
});

test('ChartData.frameAtIndexInterpolated should cope with missing data points', tt => {
    const data = new ChartData(frameableRows, columns);
    const answer = fromJS([
        {
            day: 2.5,
            fruit: "apple",
            amount: 1,
            color: "green"
        },
        {
            day: 2.5,
            fruit: "fudge",
            amount: 52.5,
            color: "green"
        }
    ]);

    tt.true(is(
        data.frameAtIndexInterpolated('day', 'fruit', 1.5).rows,
        answer
    ));
});

test('ChartData.frameAtIndexInterpolated should still work when data points are not unique (frameColumn and primaryColumn are the same)', tt => {
    const rows = fromJS(frameableRows).push(fromJS({
        day: 3,
        fruit: "fudge",
        amount: -999,
        color: "crimson"
    }));

    const data = new ChartData(rows, columns);
    const answer = fromJS([
        {
            day: 2.5,
            fruit: "apple",
            amount: 1,
            color: "green"
        },
        {
            day: 2.5,
            fruit: "fudge",
            amount: 52.5,
            color: "green"
        }
    ]);

    tt.true(is(
        data.frameAtIndexInterpolated('day', 'fruit', 1.5).rows,
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


