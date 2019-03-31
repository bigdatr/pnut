---
title: ChartData
---

ChartData is an Immutable Record used by pnut charts to represent chart data.
It stores rows of data objects whose members correspond to columns, and metadata about
the columns.

```flow
new ChartData(
	rows: Array<{
		[key: string]: string|number|null
	}>,
	columns: Array<{
		key: string,
		label: string,
		isContinuous?: boolean
	}>
);
```

## Params

### rows
**type:** `Array<{[key: string]: string|number|null}>`

An `Array` of data rows, where each row is an `Object` that contains data
for a row. 

```js
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
    }
];

const data = new ChartData(rows, columns);
```

### columns
**type:** `Array<{key: string, label: string, isContinuous?: boolean}>`

An `Array` of columns. These enable you to nominate labels for your columns, and provide a default 
column order.

```js
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

const data = new ChartData(rows, columns);
```


## Properties

### .rows
**type:** `Array<ChartRow>`

An array of all the rows of data.

### .columns
**type:** `{[key: string]: ChartColumn}`

An `OrderedMap` containing this `ChartData`'s column definitions, which are each Immutable
Records of type `ChartColumn`.



## Methods

### .updateRows()
**type:** `(updater: RowUpdater) => ChartData`

Returns a new `ChartData` with updated `rows`.

```js
const chartData = new ChartData(rows, columns);
return chartData.update(rows => rows.filter(row => row.get('filterMe')));
```

### .updateColumns()
**type:** `(updater: ColumnUpdater) => ChartData`

Returns a new `ChartData` with updated `columns`.

```jsx
const chartData = new ChartData(rows, columns);
const newColumn = {
  key: 'month',
  label: 'Month'
};
return chartData.update(col => col.set('month', newColumn));
```


### .mapRows()
**type:** `(mapper: RowMapper) => ChartData`

Maps over each row, calling `mapper` for each row, and constructs a new `ChartData`
from the results.
If you want to return something other than a `ChartData`, use `chartData.rows.map()`.

```jsx
const chartData = new ChartData(rows, columns);
return chartData.mapRows(ii => ii * 2);
```


### .getColumnData()
**type:** `(column: string) => List<ChartScalar>`

Returns all the data in a single column.

```jsx
const chartData = new ChartData(rows, columns);
return data.getColumnData('fruit');
returns List("apple", "apple", "orange", "peach", "pear")
```


### .getUniqueValues()
**type:** `(columns: ChartColumnArg) => ?List<ChartScalar>`

For a given column, or `Array` or `List` of columns, this returns a `List` of unique values in those columns, in the order that
each unique value first appears in `rows`.

You can also return the number of unique values by calling `getUniqueValues().size`.




### .makeFrames()
**type:** `(column: string) => List<List<ChartRow>>|null`

This breaks `rows` data into frames, which are rows grouped by unique values of a
specifed `frameColumn`.

Returns a `List` of frames, where each frame is a `List`s of chart rows, or null if columns have been
set but the column could not be found.

This method assumes that rows in the `frameColumn` are already sorted in the correct order.




### .frameAtIndex()
**type:** `(frameColumn: string, index: number) => ?ChartData`

This make `rows` data into frames returns a new `ChartData` containing only data at the given
frame index.

The frames will be sorted in the order that each frame's unique value first appears in `rows`.

This method assumes that rows in the `frameColumn` are already sorted in the correct order.

```jsx
const rows = [
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
        day: 5,
        fruit: "apple",
        amount: 0
    },
    {
        day: 5,
        fruit: "banana",
        amount: 4
    },
];

// ^ this will have three frame indexes for "day"
// as there are three unique values for "day"

const chartData = new ChartData(rows, columns);
chartData.frameAtIndex("day", 0);
// ^ returns a ChartData with only rows from frame index 0,
// which includes only points where day = 1
chartData.frameAtIndex("day", 2);
// ^ returns a ChartData with only rows from frame index 2,
// which includes only points where day = 5
```



### .frameAtIndexInterpolated()
**type:** `(frameColumn: string, primaryColumn: string, index: number) => ?ChartData`

Like `frameAtIndex`, this breaks `rows` data into frames, but this can also work with
non-integer `index`es and will interpolate continuous non-primary values.

This method assumes that rows in the `frameColumn` and in `primaryColumn` are already sorted
in the correct order. This is because both of these may contain non-continuous data,
and it's best to leave the sorting of non-continuous data up to the user.

Also unlike most other `ChartData` methods, this method's results are not memoized, however
it does rely on some memoized data in its calculation.
This decision will be reassessed once animation performance and memory footprint are analyzed.

```js
const rows = [
    {
        day: 1,
        price: 10,
        amount: 2
    },
    {
        day: 1,
        price: 20,
        amount: 40
    },
    {
        day: 2,
        price: 10,
        amount: 4
    },
    {
        day: 2,
        price: 20,
        amount: 30
    }
];
```


### .min()
**type:** `(columns: ChartColumnArg) => ?ChartScalar`

Get the minimum non-null value in a column, or `Array` or `List`, of columns.




### .max()
**type:** `(columns: ChartColumnArg) => ?ChartScalar`

Get the maximum value in a column, or `Array` or `List`, of columns.




### .extent()
**type:** `(columns: ChartColumnArg) => Array<?ChartScalar>`

Gets the minimum and maximum non-null value in a column, or `Array` or `List`, of columns,
returned as an array of `[min, max]`.

  



### .sum()
**type:** `(columns: ChartColumnArg) => ?ChartScalar`

Get the sum of the values in a column, or `Array` or `List`, of columns.



### .average()
**type:** `(columns: ChartColumnArg) => ?ChartScalar`

Get the average of the values in a column, or `Array` or `List`, of columns.



### .median()
**type:** `(columns: ChartColumnArg) => ?ChartScalar`

Get the median of the values in a column, or `Array` or `List`, of columns.




### .quantile()
**type:** `(columns: ChartColumnArg, p: number) => ?ChartScalar`

Get the p quantile of the values in a column (or `Array` or `List` of columns), where p is a
number in the range [0, 1]. For example, the median can be computed using p = 0.5, the first
quartile at p = 0.25, and the third quartile at p = 0.75. This uses [d3's quantile](https://github.com/d3/d3-array#quantile)
method. See [d3's docs](https://github.com/d3/d3-array#quantile) for details.




### .summary()
**type:** `(columns: ChartColumnArg) => ?Map<string, number>`

Get a [five number summary](https://en.wikipedia.org/wiki/Five-number_summary) of the values
in a column (or `Array` or `List` of columns).
This can be used to render a [box plot](https://en.wikipedia.org/wiki/Box_plot).

The summary consists of:

- the sample minimum (smallest observation) - `min`
- the lower quartile or first quartile - `lowerQuartile`
- the median (middle value) - `median`
- the upper quartile or third quartile - `upperQuartile`
- the sample maximum (largest observation) - `max`


### .variance()
**type:** `(columns: ChartColumnArg) => ?ChartScalar`

Get the [population variance](https://www.khanacademy.org/math/ap-statistics/quantitative-data-ap/measuring-spread-quantitative/v/variance-of-a-population)
of the values in a column, or `Array` or `List`, of columns. This uses [d3's variance method](https://github.com/d3/d3-array#variance).


### .deviation()
**type:** `(columns: ChartColumnArg) => ?ChartScalar`

Get the standard deviation of the values in a column, or `Array` or `List`, of columns.
This uses [d3's deviation method](https://github.com/d3/d3-array#deviation). The standard
deviation is defined as the square root of the variance.



### .bin()
**type:** 
```flow
(
	column: string,
	thresholds?: BinThreshold | BinThresholdGenerator,
	domain?: List<ChartScalar>|Array<ChartScalar>,
	rowMapper?: (row: Map<string, List<ChartScalar>>) => Map<string, ChartScalar>,
	columnUpdater?: (columns: List<ChartColumnDefinition>) => List<ChartColumnDefinition>
) => ?ChartData 
```

Organize the data into [bins](https://en.wikipedia.org/wiki/Data_binning) as defined by the
provided `thresholds`. Uses [d3's `histogram`](https://github.com/d3/d3-array#histograms) method.

```js
const binnedData = data.bin('month', (values, min, max, generators) => {
    return generators.freedmanDiaconis(values, min, max);
}, null, row => {
    return row.map(value => value.reduce((a,b) => a + b, 0));
});
```




## Static Methods

### ChartData.isValueContinuous()
**type:** `(value: *) => boolean` 
	
Check if the value is continuous, which means that the data type has intrinsic order.


### ChartData.isValueDate()
**type:** `(value: *) => boolean` 

Check if the value is a date and that the date is not invalid.


### ChartData.interpolate()
**type:** `interpolate(valueA: ChartScalar, valueB: ChartScalar, blend: number) => ChartScalar`

Interpolate takes two `ChartScalar` values and attempts to interpolate between them linearly.
It uses [`d3-interpolate`](https://github.com/d3/d3-interpolate) internally,
and follows the interpolation rules outlined by its [`interpolate`](https://github.com/d3/d3-interpolate#interpolate) method
with the following exceptions:

- `blend` must be between 0 and 1 inclusive.
- If either value is `null` it will return `null`.
- If ether value is `false` according to `ChartData.isContinuous()` then `interpolateDiscrete` is used instead.

```
ChartData.interpolate(10, 20, 0.2); // returns 12
ChartData.interpolate(10, 20, 0.5); // returns 15
```


### ChartData.interpolateDiscrete()
**type:** `(valueA: ChartScalar, valueB: ChartScalar, blend: number) => ChartScalar`

Interpolate discrete takes two `ChartScalar` values and returns `valueA`
when `blend` is less than 0.5, or `valueB` otherwise. It always treats the values as discrete,
even when they are continuous data types such as numbers. It's primarily used for generating
"interpolated" values for non-interpolatable data such as strings.

```js
ChartData.interpolateDiscrete(10, 20, 0.1); // returns 10
ChartData.interpolateDiscrete(10, 20, 0.5); // returns 20
```

