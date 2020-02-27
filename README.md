# pnut

Flexible chart building blocks for React. _(Somewhere between d3 and a charting library)_

<!-- vim-markdown-toc GFM -->

* [Basics](#basics)
* [Design Choices](#design-choices)
* [API](#api)
    * [Series](#series)
        * [Grouped Series](#grouped-series)
        * [Single Series](#single-series)
    * [Scales](#scales)
        * [Continuous Scale](#continuous-scale)
        * [Categorical Scale](#categorical-scale)
        * [Color Scale](#color-scale)
    * [Layout](#layout)
    * [Renderables](#renderables)
        * [Axis](#axis)
        * [Chart](#chart)
        * [Column](#column)
        * [Interaction](#interaction)
        * [Line](#line)
        * [Scatter](#scatter)
* [Examples](#examples)
    * [Line](#line-1)
    * [Multi Line](#multi-line)
    * [Stacked Area](#stacked-area)
    * [Column](#column-1)
    * [Stacked Column](#stacked-column)
    * [Grouped Column](#grouped-column)
    * [Scatter](#scatter-1)
    * [Bubble](#bubble)
    * [Histogram - TODO](#histogram---todo)
    * [Pie - TODO](#pie---todo)
    * [Must do](#must-do)
    * [Todo](#todo)

<!-- vim-markdown-toc -->



# Basics
To render a chart you need three parts:

1. A [Series](#series) for your data
2. Some [Scales](#scales)
3. [Components](#examples) to render


```jsx
import {Chart, Line, SingleSeries, ContinuousScale, ColorScale, Axis, layout} from './src/index';

function SavingsOverTime() {
    const data = [
        {day: 1, savings: 0},
        {day: 2, savings: 10},
        {day: 3, savings: 20},
        {day: 4, savings: 15},
        {day: 5, savings: 200}
    ];

    // Define our series with day as the primary dimension
    const series = SingleSeries({data});

    // calculate chart width, height and padding
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


# Design Choices
Pnut chooses to require data that would match rows from an SQL query. If you have pivoted data you will need to flatten it.

```js
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
The first step in building a chart with pnut is to build a series object. The series defines how to group your data ready for rendering in an x/y plane. Under the hood it holds your data a two dimensional array of groups and points.

### Grouped Series
Grouped series are used for things like multi line charts and stacked areas. One group per line and one point to match each x axis item.

```jsx
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

const series = new GroupedSeries({groupKey: 'type', pointKey: 'day', data});
```

### Single Series
A single series is just like group but there is only one group.

```jsx

const data = [
    {day: 1, type: 'apples', value: 0},
    {day: 2, type: 'apples', value: 10},
    {day: 3, type: 'apples', value: 20},
    {day: 4, type: 'apples', value: 15},
    {day: 5, type: 'apples', value: 200}
];

const series = new SingleSeries({data});
```

## Scales
Scales take your series and create functions that convert your data points to something that can be rendered.
A classic example of this is converting your data points to a set of x/y coordinates. Each chart renderable will require specific set of scales in order to render. Each scale can be continuous, categorical or color.p
For example:

* A line chart needs a continuous x scale, a continuous y scale, and a color scale.
* A column chart needs a categorical x scale, a continuous y scale, and a color scale.
* A bubble chart needs a continuous scale for x,y and radius, and a color scale.

### Continuous Scale
Continuous scales are for dimensions like numbers and dates, where the value is infinitely dividable.

```ts
type ContinuousScaleConfig = {
    series: Series, // A series object
    key: string, // Which key on your data points
    range: [number, number] // The min and max this scale should map to. (Often layout.yRange)
    zero?: boolean, // Force the scale to start at zero
    clamp?: boolean // Clamp values outside the series to min and max
};

// Examples
const y = ContinuousScale({series, key: 'value', range: layout.yRange, zero: true});
const x = ContinuousScale({series, key: 'date', range: layout.xRange});
```


### Categorical Scale
Categorical scales are for dimensions where the values cannot be infinitely divided. Things like name, type, or favourite color.
_Dates can also be categorical but usually require some formatting to render properly._


```ts
type CategoricalScaleConfig = {
    series: Series, // A series object
    key: string, // Which key on your data points
    padding?: number, // How much space to place between categories (Only needs for column charts)
    range: [number, number] // The min and max this scale should map to. (Often layout.xRange)
};

// Examples
const x = ContinuousScale({series, key: 'favouriteColor', range: layout.xRange, padding: 0.1});
```

### Color Scale
Color scales let you change the colors of your charts based on different attributes of your data.

There are four types:
* Key - _Use the color from a data point_
* Set - _Assign a specific color palette to each distinct item in the data. This should pair with a CategoricalScale._
* Range - _Assign a range of colors and interpolate between them based on a continuous metric. This should pair with a ContinuousScale._
* Interpolated - _Take control of the colors by providing your own interpolator. `interpolate` is given a scaled value from 0 to 1._


```ts
// Get the color from `point.myColor`
const key = ColorScale({series, key: 'myColor'});


// Assign either red, green or blue based on `point.type`
const set = ColorScale({series, key: 'type', set: ['red', 'green', 'blue']});

// Blend age values from grey to red as they get older
const range = ColorScale({series, key: 'age', range: ['#ccc', 'red']});


// Apply custom interpolation to make the top half of values red
const interpolated = ColorScale({series, key: 'type', interpolate: type => {
    return type >= 0.5 ? 'red' : '#ccc';
});

```

## Layout
Because SVG uses a coordinate system originating from the top left the layout function is used to calculate the required widths, padding and flip the y axis.

```tsx
type layout = (LayoutConfig) => LayoutReturn;

type LayoutConfig = {
    width: number,
    height: number,
    top?: number,
    bottom?: number,
    left?: number,
    right?: number
};

type LayoutReturn = {
    width: number, // Original width - left and right
    height: number, // Original height - top and bottom
    padding: {
        top: number,
        bottom: number,
        left: number,
        right: number
    },
    xRange: [number, number], // tuple from 0 to processed width
    yRange: [number, number], // flipped tuple from processed height to zero
};

// example
import {layout} from 'pnut';

const ll = layout({width: 1280, height: 720, top: 32, bottom: 32, left: 32, right: 32});

const x = ContinuousScale({series, key: 'day', range: ll.xRange});
const y = ContinuousScale({series, key: 'savings', range: ll.yRange, zero: true});

return <Chart {...ll}>
    <Axis scales={scales} position="left" />
    <Axis scales={scales} position="bottom" />
    <Line scales={scales} strokeWidth="2" />
</Chart>;
```

## Renderables

### Axis
Render axis based on your series
```ts
type Props = {
    // required
    position: 'top' | 'right' | 'bottom' | 'left',
    scales: {
        series: Series,
        x: ContinuousScale|CategoricalScale,
        y: ContinuousScale|CategoricalScale
    },

    // default
    overlap: number,
    ticks: Function,
    textFormat: Function,
    axisLine: ComponentType<*>,
    axisLineWidth: number,
    text: ComponentType<*>,
    textPadding: number,
    tickLine: ComponentType<*>,
    tickSize: number,

    // optional
    location?: number | string | Date
};
```


### Chart
Chart wraps your renderables in an svg tag and applies widths and padding.

```ts
type Props = {
    children: Node,
    height: number,
    padding?: {top?: number, bottom?: number, left?: number, right?: number},
    style?: Object,
    width: number
};
```

### Column
Render a column for each point in your series

```ts
type Props = {
    // Required scales. Must have a categorical x and a continuous y
    scales: {
        x: CategoricalScale,
        y: ContinuousScale,
        color: ColorScale,
        series: Series
    },
    // Called with the calculated props for each rect before rendering.
    updateRectProps?: Function
    strokeWidth?: number,
    stroke?: string,
};
```

### Interaction
Get information about the closest data points relative to the mouse position. 
```ts
type Props = {
    scales: {
        series: Series,
        x: ContinuousScale|CategoricalScale,
        y: ContinuousScale|CategoricalScale
    },

    // The height and width from your layout
    height: number,
    width: number,

    // How many times per second to update changes and call props.children or props.onChange
    fps?: number,

    // A render function that is given the current InteractionData.
    children: (InteractionData<A>) => Node

    // A callback fired when the user clicks on the chart somewhere.
    onClick?: (InteractionData<A>) => void,

    // A callback that is fired when the user moves their mouse.
    onChange?: (InteractionData<A>) => void,
};

type InteractionData<A> = {
    // The nearest point in the series to the mouse
    nearestPoint: A,
    
    // For instances like area or column charts the nearest point is not always 
    // the point your mouse is over. Nearest point stepped has a larger threshold 
    // before changing to the next point.
    nearestPointStepped: A,

    // An array of points that are close on the x axis to the mouse.
    // Useful for stacked charts to show all values in a tooltip.
    items: Array<A>,

    // Details on the current mouse position
    position: {
        x: number,
        y: number,
        pageX: number,
        pageY: number,
        clientX: number,
        clientY: number,
        screenX: number,
        screenY: number,
        elementWidth: number,
        elementHeight: number,
        isOver: boolean,
        isDown: boolean
    },
};
```

### Line
Render a set of lines for each group in your series
```ts
type Props = {
    scales: {
        x: ContinuousScale,
        y: ContinuousScale,
        color: ColorScale,
        series: Series
    },

    // Render line as an area chart
    area?: boolean,

    // A function that returns the chosen d3 curve generator
    curve?: Function,

    // Set the width of the line that is drawn
    strokeWidth?: number
};
```

### Scatter
Render a series of circles at each data point in your series
```ts
type Props = {
    scales: {
        x: ContinuousScale,
        y: ContinuousScale,
        radius: ContinuousScale,
        color: CategoricalScale,
        series: Series
    },

    // Set the stroke color of each circle
    stroke?: string,

    // Set the stroke width of each circle
    strokeWidth?: string
};
```


# Examples


## Line
```jsx
import {SingleSeries, ContinuousScale, ColorScale, Axis, Line, layout} from 'pnut';

function SavingsOverTime() {
    const {data} = props;
        
    // Define our series with day as the primary dimension
    const series = new SingleSeries({data});

    // calculate chart width, height and padding
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

    // Define our series with type as the grouping and day as the primary dimension
    const series = new GroupedSeries({groupKey: 'type', pointKey: 'day', data});

    // calculate chart width, height and padding
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

    // Define our series with type as the grouping and day as the primary dimension
    const series = new GroupedSeries({groupKey: 'type', pointKey: 'day', data});
        .update(stack({key: 'value'})); // stack savings metric

    // calculate chart width, height and padding
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
import {Chart, Column, SingleSeries, CategoricalScale, ContinuousScale, ColorScale, Axis, layout} from './src/index';

function ColumnChart() {
    const data = [
        {fruit: 'apple', count: 20},
        {fruit: 'pears', count: 10},
        {fruit: 'strawberry', count: 30}
    ];

    // Define our series with fruit as the primary dimension
    const series = new SingleSeries({data});

    // calculate chart width, height and padding
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
```jsx
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
    const series = new GroupedSeries({groupKey: 'type', pointKey: 'day', data});
        .update(stack({key: 'value'})); // stack savings metric

    // calculate chart width, height and padding
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
```jsx
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
    const series = new GroupedSeries({groupKey: 'type', pointKey: 'day', data});

    // calculate chart width, height and padding
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
```jsx
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
    const series = new GroupedSeries({groupKey: 'type', pointKey: 'day', data});

    // calculate chart width, height and padding
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
```jsx
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

    // Define our series with type as the grouping and day as the primary dimension
    const series = new GroupedSeries({groupKey: 'type', pointKey: 'day', data});

    // calculate chart width, height and padding
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


## Histogram - TODO
## Pie - TODO


## Must do
* Interaction - change items to xPoints, add yPoints
* Consistent styling 

## Todo
* Bar
* Pie
* Histogram
* Series.bin();




