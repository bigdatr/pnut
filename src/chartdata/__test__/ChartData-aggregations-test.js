import test from 'ava';
import ChartData from '../ChartData';
import Immutable, {Map, List} from 'immutable';

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


// extent

test('ChartData.extent should return the min and max value for a column', tt => {
    const data = new ChartData(rows, columns);
    tt.deepEqual(data.extent('supply'), [12, 34]);
});

test('ChartData.extent should return the min and max value for multiple columns', tt => {
    const data = new ChartData(rows, columns);
    tt.deepEqual(data.extent(['supply', 'demand']), [4, 99]);
});

test('ChartData.extent should return the min and max value for a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.deepEqual(data.extent('supply'), [32, 34]);
});

test('ChartData.extent should return the min and max value for a column, even with strings', tt => {
    const data = new ChartData(rowsMonths, columnsMonths);
    tt.deepEqual(data.extent('month'), ["2014-01-01", "2016-12-01"]);
});

test('ChartData.extent should return [null, null] when there are no values to compare', tt => {
    const data = new ChartData(allNulls, columns);
    tt.deepEqual(data.extent('supply'), [null, null]);
});

test('ChartData.extent should return [null, null] when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.deepEqual(data.extent('not here'), [null, null]);
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


// quantile

test('ChartData.quantile with a p value of 0.5 should match the median of values of a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.median('demand'), data.quantile('demand', 0.5));
});

test('ChartData.quantile with a p value of 0.5 should match the median of values for multiple columns', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.median(['supply', 'demand']), data.quantile(['supply', 'demand'], 0.5));
});

test('ChartData.quantile with a p value of 0 should match the min of values of a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.min('demand'), data.quantile('demand', 0));
});

test('ChartData.quantile with a p value of 0 should match the min of values for multiple columns', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.min(['supply', 'demand']), data.quantile(['supply', 'demand'], 0));
});

test('ChartData.quantile with a p value of 1 should match the max of values of a column', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.max('demand'), data.quantile('demand', 1));
});

test('ChartData.quantile with a p value of 1 should match the max of values for multiple columns', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.max(['supply', 'demand']), data.quantile(['supply', 'demand'], 1));
});

test('ChartData.quantile should return the quantile of values of a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    tt.is(data.quantile('demand', 0.5), 88);
});

test('ChartData.quantile should return null when there are no values to compare', tt => {
    const data = new ChartData(allNulls, columns);
    tt.is(data.quantile('supply', 0.5), null);
});

test('ChartData.quantile should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    data.quantile('supply', 0.5);
    tt.is(data.quantile('demand', 0.5), 56);
});

test('ChartData.quantile should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.quantile('not here', 0.5), null);
});

test('ChartData.quantile with a p value of 0.25 should return the lower quartile', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.quantile('demand', 0.25), 55);
});


// summary

test('ChartData.summary should return a five figure summary of values of a column', tt => {
    const data = new ChartData(rows, columns);
    const summary = data.summary('demand');
    tt.is(typeof summary, 'object');
    tt.is(summary.get('min'), data.min('demand'));
    tt.is(summary.get('lowerQuartile'), data.quantile('demand', 0.25));
    tt.is(summary.get('median'), data.median('demand'));
    tt.is(summary.get('upperQuartile'), data.quantile('demand', 0.75));
    tt.is(summary.get('max'), data.max('demand'));
});

test('ChartData.median should return the five figure summary of values for multiple columns', tt => {
    const data = new ChartData(rows, columns);
    const summary = data.summary(['supply', 'demand']);
    tt.is(typeof summary, 'object');
    tt.is(summary.get('min'), data.min(['supply', 'demand']));
    tt.is(summary.get('lowerQuartile'), data.quantile(['supply', 'demand'], 0.25));
    tt.is(summary.get('median'), data.median(['supply', 'demand']));
    tt.is(summary.get('upperQuartile'), data.quantile(['supply', 'demand'], 0.75));
    tt.is(summary.get('max'), data.max(['supply', 'demand']));
});

test('ChartData.summary should return a five figure summary of values of a column, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    const summary = data.summary('demand');
    tt.is(typeof summary, 'object');
    tt.is(summary.get('min'), data.min('demand'));
    tt.is(summary.get('lowerQuartile'), data.quantile('demand', 0.25));
    tt.is(summary.get('median'), data.median('demand'));
    tt.is(summary.get('upperQuartile'), data.quantile('demand', 0.75));
    tt.is(summary.get('max'), data.max('demand'));
});

test('ChartData.summary should return map with nulls when there are no values to compare', tt => {
    const data = new ChartData(allNulls, columns);
    tt.true(Immutable.is(data.summary('demand'), Map({
        min: null,
        lowerQuartile: null,
        median: null,
        upperQuartile: null,
        max: null
    })));
});

test('ChartData.summary should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    tt.false(Immutable.is(data.summary('supply'), data.summary('demand')));
});

test('ChartData.summary should return map with nulls when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.summary('not here'), null);
});


// variance/deviation

test('ChartData.variance for a column should be equal to the deviation squared', tt => {
    const data = new ChartData(rows, columns);
    const variance = data.variance('demand');
    const deviation = data.deviation('demand');
    tt.true(Math.abs(variance - Math.pow(deviation, 2)) < 0.01); // Allow for floating point errors
});

test('ChartData.variance for a multiple columns should be equal to the deviation squared', tt => {
    const data = new ChartData(rows, columns);
    const variance = data.variance(['supply', 'demand']);
    const deviation = data.deviation(['supply', 'demand']);
    tt.true(Math.abs(variance - Math.pow(deviation, 2)) < 0.01); // Allow for floating point errors
});

test('ChartData.variance for a column should be equal to the deviation squared, even with null values', tt => {
    const data = new ChartData(rowsWithNulls, columns);
    const variance = data.variance('demand');
    const deviation = data.deviation('demand');
    tt.true(Math.abs(variance - Math.pow(deviation, 2)) < 0.01); // Allow for floating point errors
});

test('ChartData.variance should return null when there are no values to compare', tt => {
    const data = new ChartData(allNulls, columns);
    tt.is(data.variance('supply'), null);
});

test('ChartData.deviation should return null when there are no values to compare', tt => {
    const data = new ChartData(allNulls, columns);
    tt.is(data.deviation('supply'), null);
});

test('ChartData.variance should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    tt.false(data.variance('demand') ==  data.variance('supply'));
});

test('ChartData.deviation should memoize per column', tt => {
    const data = new ChartData(rows, columns);
    tt.false(data.deviation('demand') ==  data.deviation('supply'));
});

test('ChartData.variance should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.variance('not here'), null);
});

test('ChartData.deviation should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.deviation('not here'), null);
});


// binning

test('ChartData.bin returns bins with only column specified', tt => {
    const data = new ChartData(rows, columns);
    tt.true(data.bin('demand').rows.size < data.rows.size);
});

test('ChartData.bin adds Lower and Upper columns', tt => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand');
    tt.true(typeof binned.rows.getIn([0, 'demandLower']) !== 'undefined');
    tt.true(typeof binned.rows.getIn([0, 'demandUpper']) !== 'undefined');
});

test('ChartData.bin should return null when provided a column that doesnt exist', tt => {
    const data = new ChartData(rows, columns);
    tt.is(data.bin('not here'), null);
});

test('ChartData.bin allows setting custom thresholds with a threshold generator function', tt => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', (values, min, max) => {
        return [80, 100];
    });

    tt.is(binned.rows.size, 2);
});

test('ChartData.bin allows setting custom thresholds with a threshold generator function that returns a list', tt => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', (values, min, max) => {
        return List([80, 100]);
    });

    tt.is(binned.rows.size, 2);
});

test('ChartData.bin accepts a count for thresholds', tt => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', 4); // Works the same as d3 ticks where number is bounds so specifying 4 thresholds will give you 3 bins

    tt.is(binned.rows.size, 3);
});

test('ChartData.bin accepts a list for thresholds', tt => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', List([10, 100]));
    tt.is(binned.rows.size, 2);
});

test('ChartData.bin allows setting a custom domain', tt => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', null, [10, 100]);

    tt.is(binned.rows.getIn([0, 'demandLower']), 10);
});

test('ChartData.bin allows setting a custom domain as a List', tt => {
    const data = new ChartData(rows, columns);
    const binned = data.bin('demand', null, List([10, 100]));

    tt.is(binned.rows.getIn([0, 'demandLower']), 10);
});

test('ChartData.bin works with dates', tt => {
    const data = new ChartData(rowsDates, columnsDates);
    const binned = data.bin('month');
    tt.true(binned.rows.getIn([0, 'monthLower']) instanceof Date);
    tt.true(binned.rows.getIn([0, 'monthUpper']) instanceof Date);
});

test('ChartData.bin allows updating of columns', tt => {
    const data = new ChartData(rowsDates, columnsDates);
    const binned = data.bin(
        'month',
        null,
        null,
        null,
        (columns) => columns.map(column => column.set('key', 'updated'))
    );

    tt.is(binned.columns.getIn(['updated', 'key']), 'updated');
});




