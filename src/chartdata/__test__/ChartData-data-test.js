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

test('ChartData Record can be created with nothing passed in', () => {
    const data = new ChartData();
    expect(data.rows.length).toBe(0);
    expect(data.columns.length).toBe(0);
});

test('ChartData Record can be created with only rows passed in', () => {
    const data = new ChartData(rows);
    expect(data.rows).toEqual(rows);
    expect(data.columns.length).toBe(0);
});

//
// rows
//

test('ChartData Record can be created with rows', () => {
    const data = new ChartData(rows, columns);
    expect(data.rows).toEqual(rows);
});

test('ChartData contents can take immutable rows', () => {
    const data = new ChartData(rows, columns);
    expect(data.rows).toEqual(rows);
});

test('ChartData Record can create rows with date values', () => {
    const data = new ChartData(rowsWithDates, columns);
    expect(data.rows).toEqual(rowsWithDates);
});


//
// columns
//

test('ChartData Record should be able to be created with columns', () => {
    const data = new ChartData(rows, columns);
    expect(data.columns.map(ii => ii.key)).toEqual(columns.map(ii => ii.key));
    expect(data.columns.map(ii => ii.label)).toEqual(columns.map(ii => ii.label));
    expect(data.columns.map(ii => ii.isContinuous)).toEqual(columns.map(ii => ii.isContinuous));
});

test('ChartData should use column.isContinuous = true (when provided) to specify when a column contains continuous data', () => {
    const data = new ChartData(rowsWithNulls, columns);
    expect(data.columns.find(ii => ii.key === 'day').isContinuous).toBe(true);
});

test('ChartData should use column.isContinuous = false (when provided) to specify when a column doesnt contain continuous data', () => {
    const data = new ChartData(rowsWithNulls, columns.map((col, index) => index === 0 ? {...col, isContinuous: false} : col));
    expect(data.columns.find(ii => ii.key === 'day').isContinuous).toBe(false);
});

test('ChartData should automatically determine if a column is continuous', () => {
    const columnsWithoutContinuous = columns.map(({isContinuous, ...col}) => col);
    const data = new ChartData(rowsWithNulls, columnsWithoutContinuous);

    expect(data.columns.find(ii => ii.key === 'day').isContinuous).toBe(true);
    expect(data.columns.find(ii => ii.key === 'supply').isContinuous).toBe(true);
});

test('ChartData should automatically determine if a column is not continuous', () => {
    const columnsWithoutContinuous = columns.map(({isContinuous, ...col}) => col);
    const data = new ChartData(rowsWithNulls, columnsWithoutContinuous);

    expect(data.columns.find(ii => ii.key === 'fruit').isContinuous).toBe(false);
});
