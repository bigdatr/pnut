---
title: Chart
---

Chart is an organizer for D3's scales. Using the dimensions array it constructs a number of scales. It checks its children's props and applies to them the scale configurations it found.

Each scale creates 4 dynamic props on the Chart and each of it's children.

```
<dimensionName>Column
<dimensionName>ScaleType
<dimensionName>ScaleUpdate
```

Each child will inherit any of these dimension props from the Chart component. While declaring them on the child will override the parent value. This lets you declare common axis on the Chart component and specific axis on the relevant child. This flexibility makes chart construction expressive and highly customizable.

## Props

### {dimensionName}Column
**type:** `string`

Picks the dimension of [ChartData] that this scale corresponds to.

```jsx
<Chart
	dimensions={['x', 'y', 'color']}
	xColumn="time"
	yColumn="distance"
	colorColumn="velocity"
/>
```


### {dimensionName}ScaleType
**type:** `string`
**default:** `scaleLinear`  

Picks the starting d3 scale.


### {dimensionName}ScaleUpdate
**type:** `string` 

Called with scale and props after the default scale has been constructed

```
<Chart xScaleUpdate={scale => scale.padding(.1)} />
```


### demensions
**type:** `string`
 dimensions: ?Array.<string> = ["x","y"]
Dimensions to construct scales off

### width
**type:** `?number`

Total width of the chart


### height
**type:** `?number`

Total height of the chart.


### padding
**type:** `?[top: number, right: number, bottom: number, left: number]`  

Padding for axis and things. Renderable height is: height - top - bottom. Renderable width is: 
width - left - right.


### wrapper
**type:** `Component<any>`  
**default:** [Svg]


### wrapperProps
**type:** `Object`


### childWrapper
**type:** `Component<any>`  
**default:** [Svg]


### childWrapperProps
**type:** `Object`


## Examples


### Line Chart
```jsx
<Chart data={data} xColumn="time">
    <Line yColumn="distance"/>
    <Axis yColumn="distance" position="left" />
    <Axis xColumn="time" position="bottom" />
</Chart>
```

### Column chart
```jsx
<Chart data={data} xColumn="favoriteColor">
    <Column yColumn="people"/>
</Chart>
```

### Point scale scatter plot
```jsx
<Chart data={data} xColumn="favColor" xScaleType="scalePoint">
    <Line yColumn="distance"/>
</Chart>
```

### Extended scale (column chart with extra padding)
```jsx
<Chart data={data} xColumn="favoriteColor" xScale={scale => scale.padding(1)}>
    <Column yColumn="people"/>
</Chart>
```

### Complete custom scale
```jsx
var customScale = (scale, props) => {
    return scaleLog()
         .domain([props.data.min('distance'), pp.data.max('distance')])
         .range([0, props.height]);
}
<Chart data={data} xColumn="time" yScaleUpdate={customScale}>
    <Line yColumn="distance"/>
</Chart>
```


### Correlated Scales
```jsx
<Chart xColumn="days">
   <Axis dimension="x"/>
   <Chart yColumn="piracy">
       <Line/>
       <Axis dimension="y"/>
   </Chart>
   <Chart yColumn="lemonImports">
       <Line/>
       <Axis dimension="y"/>
   </Chart>
</Chart>
```


[Svg]: /docs/component/Svg
[ChartData]: /docs/data/ChartData

