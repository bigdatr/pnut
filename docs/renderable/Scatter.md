---
title: Scatter
---

Component used to render scatter/point charts. This component requires further props to define
what pieces of data it uses. See [Chart] for details.

## Props

### dotProps
**type:** `Object`

An object of props that will be spread onto the svg element used to display dots on the chart.


### dot
**type:** 
```flow
(props: {
	dotProps: {
		cx: number, // The pixel x coordinate of the dot's centre
		cy: number, // The pixel y coordinate of dot's centre
		...this.props.dotProps
	},
	// A mixture of default props and those passed through `Scatter.props.dotProps`. This object should
	// be able to be spread onto the svg element eg. `<circle {...props.columnProps}/>`.

	dimensions: Object,
	// An object containing the `x` and `y` dimension values for this chart. As well as any other
	// dimensions defined when setting up the chart.

	index: number,
	// The index for this row
	
	data: ChartData,
	// The `ChartData` object that is being used to for this chart.

	scaledData: Array<{x: number, y: number}>
	// The full array of pre scaled data.
}) => Node
```

An optional react component that will be used to render dots on the chart.
Defaults to rendering a `<circle/>`.



### data
**type:** ChartData

The ChartData Record used to contain the data for the chart.


### scaledData (required)
**type:** `Array<{x: number, y: number}>`

The pre-scaled data that is used to render points



## Examples


### Custom Dot Renderer
```jsx
<Scatter
    dot={(props) => <circle {...props.dotProps} fill='blue'/>}
/>
```




[ChartData]: /docs/data/ChartData
[Chart]: /docs/component/Chart

