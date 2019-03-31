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

const columnsDates = [
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
        isContinuous: true
    }
];
const rowsDates = [
    {
        month: new Date("2014-01-01"),
        supply: 123605,
        demand: 28
    },
    {
        month: new Date("2014-02-01"),
        supply: 457959,
        demand: 72
    },
    {
        month: new Date("2014-03-01"),
        supply: 543558,
        demand: 96
    },
    {
        month: new Date("2016-10-01"),
        supply: 1810362,
        demand: 227
    },
    {
        month: new Date("2016-11-01"),
        supply: 1877047,
        demand: 247
    },
    {
        month: new Date("2016-12-01"),
        supply: 770154,
        demand: 204
    }
];

// min

test('ChartData.min should return the minimum value for a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.min('supply')).toBe(12);
});

test('ChartData.min should return the minimum value for multiple columns', () => {
    const data = new ChartData(rows, columns);
    expect(data.min(['supply', 'demand'])).toBe(4);
});

test('ChartData.min should return the minimum value for a column, even with null values', () => {
    const data = new ChartData(rowsWithNulls, columns);
    expect(data.min('supply')).toBe(32);
});

test('ChartData.min should return the minimum value for a column, even with strings', () => {
    const data = new ChartData(rowsMonths, columnsMonths);
    expect(data.min('month')).toBe("2014-01-01");
});

test('ChartData.min should return null when there are no values to compare', () => {
    const data = new ChartData(allNulls, columns);
    expect(data.min('supply')).toBe(null);
});

test('ChartData.min should memoize per column', () => {
    const data = new ChartData(rows, columns);
    data.min('demand');
    expect(data.min('supply')).toBe(12);
});

test('ChartData.min should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.min('not here')).toBe(null);
});

// max

test('ChartData.max should return the maximum value for a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.max('day')).toBe(19);
});

test('ChartData.max should return the maximum value for multiple columns', () => {
    const data = new ChartData(rows, columns);
    expect(data.max(['supply', 'demand'])).toBe(99);
});


test('ChartData.max should return the maximum value for a column, even with null values', () => {
    const data = new ChartData(rowsWithNulls, columns);
    expect(data.max('supply')).toBe(34);
});

test('ChartData.max should return the maximum value for a column, even with strings', () => {
    const data = new ChartData(rowsMonths, columnsMonths);
    expect(data.max('month')).toBe("2016-12-01");
});

test('ChartData.max should return null when there are no values to compare', () => {
    const data = new ChartData(allNulls, columns);
    expect(data.max('supply')).toBe(null);
});

test('ChartData.max should memoize per column', () => {
    const data = new ChartData(rows, columns);
    data.max('demand');
    expect(data.max('day')).toBe(19);
});

test('ChartData.max should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.max('not here')).toBe(null);
});


// extent

test('ChartData.extent should return the min and max value for a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.extent('supply')).toEqual([12, 34]);
});

test('ChartData.extent should return the min and max value for multiple columns', () => {
    const data = new ChartData(rows, columns);
    expect(data.extent(['supply', 'demand'])).toEqual([4, 99]);
});

test('ChartData.extent should return the min and max value for a column, even with null values', () => {
    const data = new ChartData(rowsWithNulls, columns);
    expect(data.extent('supply')).toEqual([32, 34]);
});

test('ChartData.extent should return the min and max value for a column, even with strings', () => {
    const data = new ChartData(rowsMonths, columnsMonths);
    expect(data.extent('month')).toEqual(["2014-01-01", "2016-12-01"]);
});

test('ChartData.extent should return [null, null] when there are no values to compare', () => {
    const data = new ChartData(allNulls, columns);
    expect(data.extent('supply')).toEqual([null, null]);
});

test('ChartData.extent should return [null, null] when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.extent('not here')).toEqual([null, null]);
});


// sum

test('ChartData.sum should return the sum of values of a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.sum('demand')).toBe(302);
});

test('ChartData.sum should return the sum of values for multiple columns', () => {
    const data = new ChartData(rows, columns);
    expect(data.sum(['supply', 'demand'])).toBe(415);
});

test('ChartData.sum should return the sum of values of a column, even with null values', () => {
    const data = new ChartData(rowsWithNulls, columns);
    expect(data.sum('demand')).toBe(77 + 88 + 99);
});

test('ChartData.sum should return zero when there are no values to compare', () => {
    const data = new ChartData(allNulls, columns);
    expect(data.sum('supply')).toBe(0);
});

test('ChartData.sum should memoize per column', () => {
    const data = new ChartData(rows, columns);
    data.sum('supply');
    expect(data.sum('demand')).toBe(302);
});

test('ChartData.sum should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.sum('not here')).toBe(null);
});

// average

test('ChartData.average should return the average of values of a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.average('supply')).toBe(22.6);
});

test('ChartData.average should return the average of values for multiple columns', () => {
    const data = new ChartData(rows, columns);
    expect(data.average(['supply', 'demand'])).toBe(41.5);
});

test('ChartData.average should return the average of values of a column, even with null values', () => {
    const data = new ChartData(rowsWithNulls, columns);
    expect(data.average('supply')).toBe(33);
});

test('ChartData.average should return null when there are no values to compare', () => {
    const data = new ChartData(allNulls, columns);
    expect(data.average('supply')).toBe(null);
});

test('ChartData.average should memoize per column', () => {
    const data = new ChartData(rows, columns);
    data.average('demand');
    expect(data.average('supply')).toBe(22.6);
});

test('ChartData.average should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.average('not here')).toBe(null);
});

// median

test('ChartData.median should return the median of values of a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.median('demand')).toBe(56);
});

test('ChartData.median should return the median of values for multiple columns', () => {
    const data = new ChartData(rows, columns);
    expect(data.median(['supply', 'demand'])).toBe(33);
});

test('ChartData.median should return the median of values of a column, even with null values', () => {
    const data = new ChartData(rowsWithNulls, columns);
    expect(data.median('demand')).toBe(88);
});

test('ChartData.median should return null when there are no values to compare', () => {
    const data = new ChartData(allNulls, columns);
    expect(data.median('supply')).toBe(null);
});

test('ChartData.median should memoize per column', () => {
    const data = new ChartData(rows, columns);
    data.median('supply');
    expect(data.median('demand')).toBe(56);
});

test('ChartData.median should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.median('not here')).toBe(null);
});


// quantile

test('ChartData.quantile with a p value of 0.5 should match the median of values of a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.median('demand')).toBe(data.quantile('demand', 0.5));
});

test('ChartData.quantile with a p value of 0.5 should match the median of values for multiple columns', () => {
    const data = new ChartData(rows, columns);
    expect(data.median(['supply', 'demand'])).toBe(data.quantile(['supply', 'demand'], 0.5));
});

test('ChartData.quantile with a p value of 0 should match the min of values of a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.min('demand')).toBe(data.quantile('demand', 0));
});

test('ChartData.quantile with a p value of 0 should match the min of values for multiple columns', () => {
    const data = new ChartData(rows, columns);
    expect(data.min(['supply', 'demand'])).toBe(data.quantile(['supply', 'demand'], 0));
});

test('ChartData.quantile with a p value of 1 should match the max of values of a column', () => {
    const data = new ChartData(rows, columns);
    expect(data.max('demand')).toBe(data.quantile('demand', 1));
});

test('ChartData.quantile with a p value of 1 should match the max of values for multiple columns', () => {
    const data = new ChartData(rows, columns);
    expect(data.max(['supply', 'demand'])).toBe(data.quantile(['supply', 'demand'], 1));
});

test('ChartData.quantile should return the quantile of values of a column, even with null values', () => {
    const data = new ChartData(rowsWithNulls, columns);
    expect(data.quantile('demand', 0.5)).toBe(88);
});

test('ChartData.quantile should return null when there are no values to compare', () => {
    const data = new ChartData(allNulls, columns);
    expect(data.quantile('supply', 0.5)).toBe(null);
});

test('ChartData.quantile should memoize per column', () => {
    const data = new ChartData(rows, columns);
    data.quantile('supply', 0.5);
    expect(data.quantile('demand', 0.5)).toBe(56);
});

test('ChartData.quantile should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.quantile('not here', 0.5)).toBe(null);
});

test('ChartData.quantile with a p value of 0.25 should return the lower quartile', () => {
    const data = new ChartData(rows, columns);
    expect(data.quantile('demand', 0.25)).toBe(55);
});


// summary

test('ChartData.summary should return a five figure summary of values of a column', () => {
    const data = new ChartData(rows, columns);
    const summary = data.summary('demand');
    expect(typeof summary).toBe('object');
    expect(summary.min).toBe(data.min('demand'));
    expect(summary.lowerQuartile).toBe(data.quantile('demand', 0.25));
    expect(summary.median).toBe(data.median('demand'));
    expect(summary.upperQuartile).toBe(data.quantile('demand', 0.75));
    expect(summary.max).toBe(data.max('demand'));
});

test('ChartData.median should return the five figure summary of values for multiple columns', () => {
    const data = new ChartData(rows, columns);
    const summary = data.summary(['supply', 'demand']);
    expect(typeof summary).toBe('object');
    expect(summary.min).toBe(data.min(['supply', 'demand']));
    expect(summary.lowerQuartile).toBe(data.quantile(['supply', 'demand'], 0.25));
    expect(summary.median).toBe(data.median(['supply', 'demand']));
    expect(summary.upperQuartile).toBe(data.quantile(['supply', 'demand'], 0.75));
    expect(summary.max).toBe(data.max(['supply', 'demand']));
});

test('ChartData.summary should return a five figure summary of values of a column, even with null values', () => {
    const data = new ChartData(rowsWithNulls, columns);
    const summary = data.summary('demand');
    expect(typeof summary).toBe('object');
    expect(summary.min).toBe(data.min('demand'));
    expect(summary.lowerQuartile).toBe(data.quantile('demand', 0.25));
    expect(summary.median).toBe(data.median('demand'));
    expect(summary.upperQuartile).toBe(data.quantile('demand', 0.75));
    expect(summary.max).toBe(data.max('demand'));
});

test('ChartData.summary should return a map with nulls when there are no values to compare', () => {
    const data = new ChartData(allNulls, columns);
    expect(data.summary('demand')).toEqual({
        min: null,
        lowerQuartile: null,
        median: null,
        upperQuartile: null,
        max: null
    })
});

test('ChartData.summary should memoize per column', () => {
    const data = new ChartData(rows, columns);
    expect(data.summary('supply')).not.toEqual(data.summary('demand'));
});

test('ChartData.summary should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.summary('not here')).toBe(null);
});


// variance/deviation

test('ChartData.variance for a column should be equal to the deviation squared', () => {
    const data = new ChartData(rows, columns);
    const variance = data.variance('demand');
    const deviation = data.deviation('demand');
    expect(Math.abs(variance - Math.pow(deviation, 2)) < 0.01).toBe(true); // Allow for floating point errors
});

test('ChartData.variance for a multiple columns should be equal to the deviation squared', () => {
    const data = new ChartData(rows, columns);
    const variance = data.variance(['supply', 'demand']);
    const deviation = data.deviation(['supply', 'demand']);
    expect(Math.abs(variance - Math.pow(deviation, 2)) < 0.01).toBe(true); // Allow for floating point errors
});

test('ChartData.variance for a column should be equal to the deviation squared, even with null values', () => {
    const data = new ChartData(rowsWithNulls, columns);
    const variance = data.variance('demand');
    const deviation = data.deviation('demand');
    expect(Math.abs(variance - Math.pow(deviation, 2)) < 0.01).toBe(true); // Allow for floating point errors
});

test('ChartData.variance should return null when there are no values to compare', () => {
    const data = new ChartData(allNulls, columns);
    expect(data.variance('supply')).toBe(null);
});

test('ChartData.deviation should return null when there are no values to compare', () => {
    const data = new ChartData(allNulls, columns);
    expect(data.deviation('supply')).toBe(null);
});

test('ChartData.variance should memoize per column', () => {
    const data = new ChartData(rows, columns);
    expect(data.variance('demand') ==  data.variance('supply')).toBe(false);
});

test('ChartData.deviation should memoize per column', () => {
    const data = new ChartData(rows, columns);
    expect(data.deviation('demand') ==  data.deviation('supply')).toBe(false);
});

test('ChartData.variance should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.variance('not here')).toBe(null);
});

test('ChartData.deviation should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.deviation('not here')).toBe(null);
});


// binning

test('ChartData.bin returns bins with only column specified', () => {
    const data = new ChartData(rows, columns);
    expect(data.bin('demand').rows.length < data.rows.length).toBe(true);
});

test('ChartData.bin adds Lower and Upper columns', () => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand');
    expect(typeof binned.rows[0]['demandLower'] !== 'undefined').toBe(true);
    expect(typeof binned.rows[0]['demandUpper'] !== 'undefined').toBe(true);
});

test('ChartData.bin should return null when provided a column that doesnt exist', () => {
    const data = new ChartData(rows, columns);
    expect(data.bin('not here')).toBe(null);
});

test('ChartData.bin allows setting custom thresholds with a threshold generator function', () => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', (values, min, max) => {
        return [80, 100];
    });

    expect(binned.rows.length).toBe(2);
});

test('ChartData.bin allows setting custom thresholds with a threshold generator function that returns a list', () => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', (values, min, max) => {
        return [80, 100];
    });

    expect(binned.rows.length).toBe(2);
});

test('ChartData.bin accepts a count for thresholds', () => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', 4); // Works the same as d3 ticks where number is bounds so specifying 4 thresholds will give you 3 bins

    expect(binned.rows.length).toBe(3);
});

test('ChartData.bin accepts a list for thresholds', () => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', [10, 100]);
    expect(binned.rows.length).toBe(2);
});

test('ChartData.bin allows setting a custom domain', () => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', null, [10, 100]);

    expect(binned.rows[0]['demandLower']).toBe(10);
});

test('ChartData.bin allows setting a custom domain as a List', () => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', null, [10, 100]);

    expect(binned.rows[0]['demandLower']).toBe(10);
});

test('ChartData.bin works with dates', () => {
    const data = new ChartData(rowsDates, columnsDates);
    const binned = data.bin('month');
    expect(binned.rows[0]['monthLower'] instanceof Date).toBe(true);
    expect(binned.rows[0]['monthUpper'] instanceof Date).toBe(true);
});

test('ChartData.bin allows updating of columns', () => {
    const data = new ChartData(rowsDates, columnsDates);
    const binned = data.bin(
        'month',
        null,
        null,
        null,
        (columns) => columns.map(column => ({...column, key: 'updated'}))
    );

    expect(binned.columns.find(ii => ii.key === 'updated').key).toBe('updated');
});
