---
title: Column
---

Component used to render column and bar charts. 



## Props

### height (required)
**type:** `number`

The height of the canvas.


### xScale (required)
**type:** [scale]

A [d3 scale](https://github.com/d3/d3-scale) for the x axis.


### yScale (required)
**type:** [scale]

A [d3 scale](https://github.com/d3/d3-scale) for the y axis.


### scaledData (required)
**type:** `Array<{x: number, y: number}>`

The pre-scaled data that is used to render columns


### width
**type:** `number`

The width of the canvas.


### data
**type:** [ChartData]

The `ChartData` Record that contains the data for the chart.


### columnProps
**type:** 
```
{
	x: number, 
	// The pixel x coordinate of the column rectangle's top left corner

	y: number,
	// The pixel y coordinate of the column rectangle's top left corner

	width: number,
	// The width of the column rectangle

	height: number,
	// The height of the column rectangle

	dimensions: Object,
	// An object containing the `x` and `y` dimension values for this chart. As well as any other
	// dimensions defined when setting up the chart.

	index: number,
	// The index for this row

	data: ChartData,
	// The `ChartData` object that is being used to for this chart.

	scaledData: Array<Object>
	// The full array of pre scaled data.
}
```

An object of props that will be spread onto the svg element used to render the bar/column
By default the svg element is a [`<rect>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)


### column
**type:** `(columnProps) => Node`

An optional custom column renderer component.


### orientation
**type:** `'vertical'|'horizontal'`

Force a particular orientation for the chart. `'vertical'` will render a column chart
and `'horizontal'` will render a bar chart. This is likely not required – in almost all
cases the orientation can be inferred from the scales.



## Examples



[ChartData]: /docs/data/ChartData
[Scale]: /docs/data/Scale

