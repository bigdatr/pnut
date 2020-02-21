# pnut
[![pnut npm](https://img.shields.io/npm/v/pnut.svg?style=flat-square)](https://www.npmjs.com/package/pnut)
[![pnut circle](https://img.shields.io/circleci/project/github/bigdatr/pnut.svg?style=flat-square)](https://circleci.com/gh/bigdatr/pnut)

Flexible chart building blocks for React. _(Somewhere between d3 and a charting library)_


# Basics
To render a chart you need three parts:

1. A [Series](#series) for your data
2. Some [Scales](#scales)
3. [Components](#examples) to render


```jsx
import {Chart, Line, Series, ContinuousScale, ColorScale, Axis, layout} from './src/index';

function SavingsOverTime() {
    const data = [
        {day: 1, savings: 0},
        {day: 2, savings: 10},
        {day: 3, savings: 20},
        {day: 4, savings: 15},
        {day: 5, savings: 200}
    ];

    // Define our series with day as the primary dimension
    const series = Series.single('day', data);

    // calculate chart width, height and palling
    const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

    // Set up scales to define our x, y and color
    const x = ContinuousScale({series, key: 'day', range: ll.xRange});
    const y = ContinuousScale({series, key: 'savings', range: ll.yRange, zero: true});
    const color = ColorScale({series, key: 'savings', set: ['#ee4400']});


    // create a scales object for each of our renderable components
    const scales = {series, x, y, color};

    // render a chart with two axis and a line
    return <Chart {...ll}>
        <Axis scales={scales} position="left" />
        <Axis scales={scales} position="bottom" />
        <Line scales={scales} strokeWidth="2" />
    </Chart>;
}
```


# API Choices
Pnut chooses to require data that would match rows from an SQL query. If you have pivoted data you will need to flatten it.
```
// good
[
	{value: 10, type: 'apples'},
	{value: 20, type: 'oranges'},
]
// bad
[
	{apples: 10, oranges: 20}
]
```



# API

## Series
### Grouped
### Single

---

## Continuous Scale

---

## Categorical Scale

---

## Color Scale
Color scales let you change the colors of your charts based on different attributes of your data.
There are four types:

### Key
Grab the color directly from a data point based on a key.
```js
// Get the color from `point.myColor`
const color = ColorScale({series, key: 'myColor'});
```

### Set (Categorical)
Assign a specific color palette to each distinct item in the data. This should pair with a CategoricalScale.
```js
// Assign either red, green or blue based on `point.type`
const color = ColorScale({series, key: 'type', set: ['red', 'green', 'blue']});
```

### Range (Continuous)
Assign a range of colors and interpolate between them based on a continuous metric. This should pair with a ContinuousScale.
```js
// Blend age values from grey to red as they get older
const color = ColorScale({series, key: 'age', range: ['#ccc', 'red']});
```

### Interpolated (Continuous)
Take control of the colors by providing your own interpolator. `interpolate` is given a scaled value from 0 to 1.
```js
// Make the top half of values red
const color = ColorScale({series, key: 'type', interpolate: type => {
	return type >= 0.5 ? 'red' : '#ccc';
});
```





# Examples


## Line
```jsx
import {Series, ContinuousScale, ColorScale, Axis, Line, layout} from 'pnut';

function SavingsOverTime() {
	const {data} = props;
		
	// Define our series with day as the primary dimension
	const series = Series.single('day', data);

	// calculate chart width, height and palling
	const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

	// Set up scales to define our x, y and color
	const x = ContinuousScale({series, key: 'day', range: ll.xRange});
	const y = ContinuousScale({series, key: 'savings', range: ll.yRange, zero: true});
	const color = ColorScale({series, key: 'savings', set: ['red']});


	// create a scales object for each of our renderable components
	const scales = {series, x, y, color};

	// render a chart with two axis and a line
	return <Chart {...ll}>
		<Axis scales={scales} position="left" />
		<Axis scales={scales} position="bottom" />
		<Line scales={scales} strokeWidth="2" />
	</Chart>;
}
```


## Multi Line
```jsx
import {Chart, Line, Series, ContinuousScale, ColorScale, Axis, layout} from './src/index';

function MultiLine() {
    const data = [
        {day: 1, type: 'apples', value: 0},
        {day: 2, type: 'apples', value: 10},
        {day: 3, type: 'apples', value: 20},
        {day: 4, type: 'apples', value: 15},
        {day: 5, type: 'apples', value: 200},
        {day: 1, type: 'oranges', value: 200},
        {day: 2, type: 'oranges', value: 50},
        {day: 3, type: 'oranges', value: 30},
        {day: 4, type: 'oranges', value: 24},
        {day: 5, type: 'oranges', value: 150}
    ];

    // Define our series with day as the primary dimension
    const series = Series.group('type', 'day', data);

    // calculate chart width, height and palling
    const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

    // Set up scales to define our x, y and color
    const x = ContinuousScale({series, key: 'day', range: ll.xRange});
    const y = ContinuousScale({series, key: 'value', range: ll.yRange, zero: true});
    const color = ColorScale({series, key: 'type', set: ['red', 'orange']});


    // create a scales object for each of our renderable components
    const scales = {series, x, y, color};

    // render a chart with two axis and a line
    return <Chart {...ll}>
        <Axis scales={scales} position="left" />
        <Axis scales={scales} position="bottom" />
        <Line scales={scales} strokeWidth="2" />
    </Chart>;
}
```


## Stacked Area
```jsx
import {Chart, Line, Series, ContinuousScale, ColorScale, Axis, layout, stack} from './src/index';

function StackedArea() {
    const data = [
        {day: 1, type: 'apples', value: 0},
        {day: 2, type: 'apples', value: 10},
        {day: 3, type: 'apples', value: 20},
        {day: 4, type: 'apples', value: 15},
        {day: 5, type: 'apples', value: 200},
        {day: 1, type: 'oranges', value: 200},
        {day: 2, type: 'oranges', value: 50},
        {day: 3, type: 'oranges', value: 30},
        {day: 4, type: 'oranges', value: 24},
        {day: 5, type: 'oranges', value: 150}
    ];

    // Define our series with day as the primary dimension
    const series = Series.group('type', 'day', data)
		.update(stack({key: 'value'})); // stack savings metric

    // calculate chart width, height and palling
    const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

    // Set up scales to define our x, y and color
    const x = ContinuousScale({series, key: 'day', range: ll.xRange});
    const y = ContinuousScale({series, key: 'value', range: ll.yRange, zero: true});
    const color = ColorScale({series, key: 'type', set: ['red', 'orange']});


    // create a scales object for each of our renderable components
    const scales = {series, x, y, color};

    // render a chart with two axis and a line
    return <Chart {...ll}>
        <Axis scales={scales} position="left" />
        <Axis scales={scales} position="bottom" />
        <Line area={true} scales={scales} strokeWidth="2" />
    </Chart>;
}
```


## Column
```jsx
import {Chart, Column, Series, CategoricalScale, ContinuousScale, ColorScale, Axis, layout} from './src/index';

function ColumnChart() {
    const data = [
        {fruit: 'apple', count: 20},
        {fruit: 'pears', count: 10},
        {fruit: 'strawberry', count: 30}
    ];

    // Define our series with day as the primary dimension
    const series = Series.single('fruit', data);

    // calculate chart width, height and palling
    const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

    // Set up scales to define our x,y and color
    const x = CategoricalScale({series, key: 'fruit', range: ll.xRange, padding: 0.1});
    const y = ContinuousScale({series, key: 'count', range: ll.yRange, zero: true});
    const color = ColorScale({series, key: 'fruit', set: ['red', 'green', 'blue']});


    // create a scales object for each of our renderable components
    const scales = {series, x, y, color};

    // render a chart with two axis and a line
    return <Chart {...ll}>
        <Axis scales={scales} position="left" />
        <Axis scales={scales} position="bottom" />
        <Column scales={scales} />
    </Chart>;
}
```


## Stacked Column
```
import {Chart, Column, Series, CategoricalScale, ContinuousScale, ColorScale, Axis, layout, stack} from './src/index';

function StackedColumn() {
    const data = [
        {day: 1, type: 'apples', value: 10},
        {day: 2, type: 'apples', value: 10},
        {day: 3, type: 'apples', value: 20},
        {day: 4, type: 'apples', value: 15},
        {day: 5, type: 'apples', value: 200},
        {day: 1, type: 'oranges', value: 200},
        {day: 2, type: 'oranges', value: 50},
        {day: 3, type: 'oranges', value: 30},
        {day: 4, type: 'oranges', value: 24},
        {day: 5, type: 'oranges', value: 150}
    ];

    // Define our series with day as the primary dimension
    const series = Series.group('type', 'day', data)
		.update(stack({key: 'value'})); // stack savings metric

    // calculate chart width, height and palling
    const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

    // Set up scales to define our x,y and color
    const x = CategoricalScale({series, key: 'day', range: ll.xRange, padding: 0.1});
    const y = ContinuousScale({series, key: 'value', range: ll.yRange, zero: true});
    const color = ColorScale({series, key: 'type', set: ['red', 'green']});


    // create a scales object for each of our renderable components
    const scales = {series, x, y, color};

    // render a chart with two axis and a line
    return <Chart {...ll}>
        <Axis scales={scales} position="left" />
        <Axis scales={scales} position="bottom" />
        <Column scales={scales} />
    </Chart>;
}
```
## Grouped Column
```
import {Chart, Column, Series, CategoricalScale, ContinuousScale, ColorScale, Axis, layout} from './src/index';

function GroupedColumn() {
    const data = [
        {day: 1, type: 'apples', value: 10},
        {day: 2, type: 'apples', value: 10},
        {day: 3, type: 'apples', value: 20},
        {day: 4, type: 'apples', value: 15},
        {day: 5, type: 'apples', value: 200},
        {day: 1, type: 'oranges', value: 200},
        {day: 2, type: 'oranges', value: 50},
        {day: 3, type: 'oranges', value: 30},
        {day: 4, type: 'oranges', value: 24},
        {day: 5, type: 'oranges', value: 150}
    ];

    // Define our series with day as the primary dimension
    const series = Series.group('type', 'day', data);

    // calculate chart width, height and palling
    const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

    // Set up scales to define our x,y and color
    const x = CategoricalScale({series, key: 'day', range: ll.xRange, padding: 0.1});
    const y = ContinuousScale({series, key: 'value', range: ll.yRange, zero: true});
    const color = ColorScale({series, key: 'type', set: ['red', 'green']});


    // create a scales object for each of our renderable components
    const scales = {series, x, y, color};

    // render a chart with two axis and a line
    return <Chart {...ll}>
        <Axis scales={scales} position="left" />
        <Axis scales={scales} position="bottom" />
        <Column scales={scales} />
    </Chart>;
}
```

## Scatter
```
import {Chart, Scatter, Series, ContinuousScale, ColorScale, Axis, layout} from './src/index';

function ScatterChart() {
    const data = [
        {day: 1, type: 'apples', value: 0},
        {day: 2, type: 'apples', value: 10},
        {day: 3, type: 'apples', value: 20},
        {day: 4, type: 'apples', value: 15},
        {day: 5, type: 'apples', value: 200},
        {day: 1, type: 'oranges', value: 200},
        {day: 2, type: 'oranges', value: 50},
        {day: 3, type: 'oranges', value: 30},
        {day: 4, type: 'oranges', value: 24},
        {day: 5, type: 'oranges', value: 150}
    ];

    // Define our series with day as the primary dimension
    const series = Series.group('type', 'day', data);

    // calculate chart width, height and palling
    const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

    // Set up scales to define our x, y and color
    const x = ContinuousScale({series, key: 'day', range: ll.xRange});
    const y = ContinuousScale({series, key: 'value', range: ll.yRange});
    const radius = ContinuousScale({series, key: 'value', range: [2, 2]});
    const color = ColorScale({series, key: 'type', set: ['red', 'orange']});


    // create a scales object for each of our renderable components
    const scales = {series, x, y, radius, color};

    // render a chart with two axis and a line
    return <Chart {...ll}>
        <Axis scales={scales} position="left" />
        <Axis scales={scales} position="bottom" />
        <Scatter scales={scales} strokeWidth="2" />
    </Chart>;
}

```
## Bubble
```
import {Chart, Scatter, Series, ContinuousScale, ColorScale, Axis, layout} from './src/index';

function BubbleChart() {
    const data = [
        {day: 1, size: 200, value: 0},
        {day: 2, size: 800, value: 10},
        {day: 3, size: 900, value: 20},
        {day: 4, size: 200, value: 15},
        {day: 5, size: 300, value: 200},
        {day: 6, size: 400, value: 100},
        {day: 7, size: 300, value: 20}
    ];

    // Define our series with day as the primary dimension
    const series = Series.group('type', 'day', data);

    // calculate chart width, height and palling
    const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

    // Set up scales to define our x, y and color
    const x = ContinuousScale({series, key: 'day', range: ll.xRange});
    const y = ContinuousScale({series, key: 'value', range: ll.yRange});
    const radius = ContinuousScale({series, key: 'size', range: [2, 10]});
    const color = ColorScale({series, key: 'type', set: ['orange']});


    // create a scales object for each of our renderable components
    const scales = {series, x, y, radius, color};

    // render a chart with two axis and a line
    return <Chart {...ll}>
        <Axis scales={scales} position="left" />
        <Axis scales={scales} position="bottom" />
        <Scatter scales={scales} strokeWidth="2" />
    </Chart>;
}
```


## Histogram
```
@todo
```

## Pie
```
@todo
```


## TODO
* Bar
* Histogram
* Series.bin();



