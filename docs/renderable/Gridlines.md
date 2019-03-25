---
title: Gridlines
---

Draws gridlines on the chart canvas


## Props

### lineVertical (required)
**type:** `() => Node`

A custom component used to render a vertical line.
Defaults to rendering a svg `<line/>`.


### lineHorizontal (required)
**type:** `() => Node`

A custom component used to render a horizontal line.
Defaults to rendering a `<line/>`.


### xScale (required)
**type:** [scale]

Any d3-scale for the x axis.


### yScale (required)
**type:** [scale]

Any d3-scale for the y axis.


### xTicks
**type:** `(scale) => Array<Node>`

An array of ticks to render as vertical gridlines. In most cases this can be constructed
by calling the scale's [`ticks`](https://github.com/d3/d3-scale#continuous_ticks) function.


### yTicks
**type:** `(scale) => Array<Node>`

An array of ticks to render as horizontal gridlines. In most cases this can be constructed
by calling the scale's [`ticks`](https://github.com/d3/d3-scale#continuous_ticks) function.




## Examples

### Custom Lines

```
<Gridlines
    width={1280}
    height={720}
    xScale={xScale}
    yScale={yScale}
    xTicks={['category1', 'category2', 'category3']}
    yTicks={yScale.ticks()}

    // optional custom lines
    lineHorizontal={(props) => {
        const {coordinates, tick} = props;
        return <line {...coordinates} strokeWidth="1" stroke="rgba(0,0,0,0.2)"/>
    }}

    lineVertical={(props) => {
        const {coordinates, tick, scale} = props;
        return <rect x={coordinates.x1 - scale.bandwidth() / 2} y={coordinates.y1} width={scale.bandwidth()} height={coordinates.y2 - coordinates.y1} fill='rgba(0,0,0,0.1)'/>
    }}
/>
```

[ChartData]: /docs/data/ChartData

