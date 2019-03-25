---
title: Histogram
---

Component used to render histogram charts. This component requires further props to define what pieces
of data it uses. 


## Props

### height (required)
**type:** `number`

The height of the canvas.


### width
**type:** `number`

The width of the canvas.


### data
**type:** `ChartData`

The `ChartData` Record that contains the data for the chart.


### scaledData (required)
**type:** `Array<{x: number, y: number}>`

The pre-scaled data that is used to render columns


### columnProps
**type:** `object`

An object of props that will be spread onto the svg element used to render the bar/column
By default the svg element is a [`<rect>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)


### column






**type:** 
```
(props: {
	x: number, // The pixel x coordinate of the column rectangle's top left corner
	y: number, // The pixel y coordinate of the column rectangle's top left corner
	width: number, // The width of the column rectangle
	height: number, // The height of the column rectangle
	dimensions: Object, // An object containing the `x` and `y` dimension values for this chart. As well as any other dimensions defined when setting up the chart.
	index: number, // The index for this row
	data: ChartData, // The `ChartData` object that is being used to for this chart.
	scaledData: Array<Object> // The full array of pre scaled data.
}) => Node
```

An optional custom column renderer component.


### orientation
**type:** `'horizontal'|'vertical'`

Force a particular orientation for the chart. `'vertical'` will render a column chart
and `'horizontal'` will render a bar chart. This is likely not required – in almost all
cases the orientation can be inferred from the scales.



## Examples

```jsx
<Histogram
    column={(props) => <rect {...props.columnProps} fill='blue'/>}
/>
```

[ChartData]: /docs/data/ChartData

