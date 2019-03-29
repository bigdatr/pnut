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

const framesAnswer = [
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
];

// makeFrames


test('ChartData.makeFrames should return a List of chart rows grouped by frameColumn', () => {
    const data = new ChartData(frameableRows, columns);
    expect(data.makeFrames('day')).toEqual(framesAnswer);
});

test('ChartData.makeFrames should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(frameableRows, columns);
    expect(data.makeFrames('not here')).toBe(null);
});

test('ChartData.makeFrames should use memoization', () => {
    const data = new ChartData(frameableRows, columns);
    expect(data.makeFrames('fruit') === data.makeFrames('fruit')).toBe(true);
});

test('ChartData.makeFrames should memoize per column', () => {
    const data = new ChartData(frameableRows, columns);
    data.makeFrames('amount');
    expect(data.makeFrames('day')).toEqual(framesAnswer);
});


// frameAtIndex

test('ChartData.frameAtIndex should return a ChartData containing data at an existing frame when passed an integer', () => {
    const data = new ChartData(frameableRows, columns);
    expect(data.frameAtIndex('day', 1).rows).toEqual(frameableRows.filter(ii => ii.day == 2));
});

test('ChartData.frameAtIndex should return null if passed an incorrect index', () => {
    const data = new ChartData(frameableRows, columns);
    expect(data.frameAtIndex('day', -1)).toBe(null);
    expect(data.frameAtIndex('day', 3)).toBe(null);
    expect(data.frameAtIndex('day', 2.3)).toBe(null);
});

test('ChartData.frameAtIndex should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(frameableRows, columns);
    expect(data.frameAtIndex('not here')).toBe(null);
});

test('ChartData.frameAtIndex should use memoization', () => {
    const data = new ChartData(frameableRows, columns);
    expect(data.frameAtIndex('fruit', 0) === data.frameAtIndex('fruit', 0)).toBe(true);
});

test('ChartData.frameAtIndex should memoize per column', () => {
    const data = new ChartData(frameableRows, columns);
    const answer = [
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
    ];
    data.frameAtIndex('amount', 0);
    expect(data.frameAtIndex('day', 0).rows).toEqual(answer);
});

test('ChartData.frameAtIndex should memoize per index', () => {
    const data = new ChartData(frameableRows, columns);
    const answer = [
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
    ];
    data.frameAtIndex('day', 1);
    expect(data.frameAtIndex('day', 0).rows).toEqual(answer);
});



// frameAtIndexIntepolated

test('ChartData.frameAtIndexInterpolated should return a ChartData containing data at an existing frame when passed an integer', () => {
    const data = new ChartData(frameableRows, columns);
    expect(data.frameAtIndexInterpolated('day', 'fruit', 1).rows).toEqual(frameableRows.filter(ii => ii.day == 2));
});

test('ChartData.frameAtIndexInterpolated should return a ChartData containing interpolated data when passed an non-integer (lerping numbers and strings)', () => {
    const data = new ChartData(frameableRows, columns);
    const answer = [
        {
            day: 1.4,
            fruit: "apple",
            amount: 2.6,
            color: "blue"
        },
        {
            day: 1.4,
            fruit: "banana",
            amount: 4.4,
            color: "blue"
        },
        {
            day: 1.4,
            fruit: "fudge",
            amount: 5,
            color: "blue"
        }
    ];

    expect(data.frameAtIndexInterpolated('day', 'fruit', 0.4).rows).toEqual(answer);

    const answer2 = [
        {
            day: 1.5,
            fruit: "apple",
            amount: 2.5,
            color: "green"
        },
        {
            day: 1.5,
            fruit: "banana",
            amount: 4.5,
            color: "green"
        },
        {
            day: 1.5,
            fruit: "fudge",
            amount: 5,
            color: "green"
        }
    ];

    expect(data.frameAtIndexInterpolated('day', 'fruit', 0.5).rows).toEqual(answer2);
});

test('ChartData.frameAtIndexInterpolated should cope with missing data points', () => {
    const data = new ChartData(frameableRows, columns);
    const answer = [
        {
            day: 2.5,
            fruit: "apple",
            amount: 1,
            color: "yellow"
        },
        {
            day: 2.5,
            fruit: "fudge",
            amount: 52.5,
            color: "yellow"
        }
    ];

    expect(data.frameAtIndexInterpolated('day', 'fruit', 1.5).rows).toEqual(answer);
});

test('ChartData.frameAtIndexInterpolated should still work when data points are not unique (frameColumn and primaryColumn are the same)', () => {
    const rows = frameableRows.concat({
        day: 3,
        fruit: "fudge",
        amount: -999,
        color: "crimson"
    });

    const data = new ChartData(rows, columns);
    const answer = [
        {
            day: 2.5,
            fruit: "apple",
            amount: 1,
            color: "yellow"
        },
        {
            day: 2.5,
            fruit: "fudge",
            amount: 52.5,
            color: "yellow"
        }
    ];

    expect(data.frameAtIndexInterpolated('day', 'fruit', 1.5).rows).toEqual(answer);
});

test('ChartData.frameAtIndexInterpolated should return null if passed an incorrect index', () => {
    const data = new ChartData(frameableRows, columns);
    expect(data.frameAtIndexInterpolated('day', 'fruit', -1)).toBe(null);
    expect(data.frameAtIndexInterpolated('day', 'fruit', 3)).toBe(null);
    expect(data.frameAtIndexInterpolated('day', 'fruit', 2.3)).toBe(null);
});

test('ChartData.frameAtIndexInterpolated should return null when provided invalid columns or column combinations', () => {
    const data = new ChartData(frameableRows, columns);
    expect(data.frameAtIndexInterpolated('not here', 'fruit')).toBe(null);
    expect(data.frameAtIndexInterpolated('day', 'not here')).toBe(null);
    expect(data.frameAtIndexInterpolated('day', 'day')).toBe(null);
});
