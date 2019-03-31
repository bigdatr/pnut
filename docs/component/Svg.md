---
title: Svg
---

Svg is a simple wrapper component used by other canvasses to provide the wrapping SVG element.

## Props

### height
**type:** `number`  

The height of the canvas - If this is not provided then the component's children won't render.
        

### width
**type:** `number`

The width of the canvas - If this is not provided then the component's children won't render.


### stroke
**type:** `?string`

### className
**type:** `?string`

### x
**type:** `?number`

The x position of the canvas

### y
**type:** `?number`  

The y position of the canvas


## Examples

```jsx
<Svg width={200} height={200}>
    <circle cx={0} cy={0} r={10}/>
</Svg>
```

[ChartData]: /docs/data/ChartData

