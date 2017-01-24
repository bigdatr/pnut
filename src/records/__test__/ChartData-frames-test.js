import test from 'ava';
import {fromJS, is} from 'immutable';
import ChartData from '../ChartData';

// dont show console errors
console.error = () => {};

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


