---
title: Axis
---

Axis renders the top, bottom, left, or right axis for a chart.

```jsx
<Axis
    width={this.props.eqWidth - 100}
    height={50}
    position='bottom'
    ticks={['category1', 'category2', 'category3']}
    scale={scaleX}
/>
```

## Props

### width (required)
**type:** `number`   

The width of the axis


### height (required)
**type:** `number`  

The height of the axis


### dimension (required)
**type:** `string`  
**isRequired:** `true`

The dimension to base this axis off. Probably x or y


### scale (required)
**type:** `Scale`

The [d3-scale](https://github.com/d3/d3-scale) for the axis


### position
**type:** `?'top'|'right'|'bottom'|'left'`

Position the axis will stick to. Defaults to `bottom` if dimension is `x` or `left` if dimension is
`y`.


### location
**type:** `number|string|Date`  

Domain value of opposite scale at which to render the axis


### axisLine
**type:** `() => Node`

Custom axisLine renderer


### axisLineProps
**type:** `Object`

An object of props that are passed to the axis line - the line that sits against the chart edge.


### axisLineWidth
**type:** `number`


### tickLine
**type:** `() => Node`

Custom tickLine renderer


### tickLineProps
**type:** `Object`

An object of props that are passed to the axis line - the line that sits against the chart edge.

### text
**type:** `() => Node`

Custom text renderer


### textProps
**type:** `Object`

An object of props that are passed to each text node


### textFormat
**type:** `(value: string) => string`

{Function} a function that is called for each tick and is passed the tick value. This can be used 
for example to add a percent symbol to the tick.

```jsx
<Axis textFormat={(value) => value + '%'} />
```
         

### tickSize
**type:** `number`

The length of the tick line.


### textPadding
**type:** `number`

The padding between a tick line and the tick text

### overlap
**type:** `number`

The distance the axis line should extend past its bounds. This can be used to make two
perpendicular axis lines overlap where they meet.



### xScale
**type:** `Scale`
The [d3-scale](https://github.com/d3/d3-scale) for the axis


### yScale
**type:** `Scale`
The [d3-scale](https://github.com/d3/d3-scale) for the axis


### ticks
**type:** `Function`
An array of ticks to display on the axis. In most cases this can be constructed by
calling the scale's [`ticks`](https://github.com/d3/d3-scale#continuous_ticks) function.



## Examples


[d3-scale]: https://github.com/d3/d3-scale

