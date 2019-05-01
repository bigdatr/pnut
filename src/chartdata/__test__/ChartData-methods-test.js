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


const rowsWithLoadsOfFruit = [
    {
        day: 1,
        supply: 34,
        demand: 99,
        fruit: "apple",
        fruit2: "fish"
    },
    {
        day: 2,
        supply: 32,
        demand: 88,
        fruit: "apple",
        fruit2: "pumpkin"
    },
    {
        day: 3,
        supply: 13,
        demand: 55,
        fruit: "orange",
        fruit2: "orange"
    },
    {
        day: 8,
        supply: 22,
        demand: 56,
        fruit: "peach",
        fruit2: "pear"
    },
    {
        day: 19,
        supply:  12,
        demand:  4,
        fruit: "pear",
        fruit2: "pear"
    }
];

const columnsWithLoadsOfFruit = [
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
    },
    {
        key: 'fruit2',
        label: 'Random fruit',
        isContinuous: false
    }
];


//
// methods
//

// updateRows

test('ChartData.updateRows should return an updated ChartData', () => {
    const data = new ChartData(rows, columns);
    const answer = [
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
    ];

    const newData = data.updateRows(rows => {
        return rows.map(row => ({...row, fruit: 'no fruit'}))
    });
    expect(newData.rows).toEqual(answer);
});

test('ChartData.updateRows should retain columns', () => {
    const data = new ChartData(rows, columns);
    const newData = data.updateRows(rows => {
        return rows.map(row => ({...row, fruit: 'no fruit'}))
    });
    expect(newData.columns).toEqual(data.columns);
});

// updateColumns

test('ChartData.updateColumns should return an updated ChartData', () => {
    const data = new ChartData(rows, columns);

    const answer = data.columns.concat({
        key: 'month',
        label: 'month',
        isContinuous: false
    });

    const newData = data.updateColumns(cols => {
        return cols.concat({
            key: 'month',
            label: 'month',
            isContinuous: false
        });
    });

    expect(newData.columns).toEqual(answer);
});

test('ChartData.updateColumns should retain rows', () => {
    const data = new ChartData(rows, columns);
    const newData = data.updateColumns(cols => {
        return cols.concat({
            key: 'month',
            label: 'month',
            isContinuous: false
        });
    });
    expect(newData.rows).toEqual(data.rows);
});

// mapRows

test('ChartData.mapRows should return an updated ChartData', () => {
    const data = new ChartData(rows, columns);
    const answer = [
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
    ];

    const newData = data.mapRows(row => ({
        ...row,
        supply: row.supply + 100,
        demand: row.demand + 100
    }));
    expect(newData.rows).toEqual(answer);
});

test('ChartData.mapRows should retain columns', () => {
    const data = new ChartData(rows, columns);
    const newData = data.mapRows(row => ({...row, fruit: 'no fruit'}));
    expect(newData.columns).toEqual(data.columns);
});

// getColumnData

test('ChartData.getColumnData should return an array of data in a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.getColumnData('fruit')).toEqual(["apple", "apple", "orange", "peach", "pear"]);
});

test('ChartData.getColumnData should return null if given a column name that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.getColumnData('not here')).toBe(null);
});

test('ChartData.getColumnData should use memoization', () => {
    const data = new ChartData(rows, columns);
    expect(data.getColumnData('fruit') === data.getColumnData('fruit')).toBe(true);
});

test('ChartData.getColumnData should memoize per column', () => {
    const data = new ChartData(rows, columns);
    data.getColumnData('demand');
    expect(data.getColumnData('fruit')).toEqual(["apple", "apple", "orange", "peach", "pear"]);
});

// getUniqueValues

test('ChartData.getUniqueValues should return a list of unique values from a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.getUniqueValues('fruit')).toEqual( ["apple", "orange", "peach", "pear"]);
});

test('ChartData.getUniqueValues should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.getUniqueValues('not here')).toBe(null);
});

test('ChartData.getUniqueValues should be able to compare dates', () => {
    const data = new ChartData(
        [{day: new Date('2018-01-01')}, {day: new Date('2018-01-01')}, {day: new Date('2018-01-02')}],
        [{key: 'day'}]
    );
    expect(data.getUniqueValues('day').length).toBe(2);
});


test('ChartData.getUniqueValues should use memoization', () => {
    const data = new ChartData(rows, columns);
    expect(data.getUniqueValues('fruit') === data.getUniqueValues('fruit')).toBe(true);
});

test('ChartData.getUniqueValues should memoize per column', () => {
    const data = new ChartData(rows, columns);
    data.getUniqueValues('demand');
    expect(data.getUniqueValues('fruit')).toEqual(["apple", "orange", "peach", "pear"]);
});


test('ChartData.getUniqueValues should return a list of unique values from mutiple columns', () => {
    const data = new ChartData(rowsWithLoadsOfFruit, columnsWithLoadsOfFruit);
    expect(data.getUniqueValues(['fruit', 'fruit2'])).toEqual(["apple", "orange", "peach", "pear", "fish", "pumpkin"]);
});

test('ChartData.getUniqueValues should return null when provided mutiple columns and a column doesnt exist', () => {
    const data = new ChartData(rowsWithLoadsOfFruit, columnsWithLoadsOfFruit);
    expect(data.getUniqueValues(['fruit2', 'not here'])).toBe(null);
});

test('ChartData.getUniqueValues should use memoization with multiple columns', () => {
    const data = new ChartData(rowsWithLoadsOfFruit, columnsWithLoadsOfFruit);
    expect(
        data.getUniqueValues(['fruit', 'fruit2']) === data.getUniqueValues(['fruit', 'fruit2'])
    ).toBe(true);
});

test('ChartData.getUniqueValues should memoize per column with multiple columns', () => {
    const data = new ChartData(rowsWithLoadsOfFruit, columnsWithLoadsOfFruit);
    data.getUniqueValues(['fruit', 'demand']);
    expect(data.getUniqueValues(['fruit', 'fruit2'])).toEqual(["apple", "orange", "peach", "pear", "fish", "pumpkin"]);
});
