---
title: Area
---

Component used to render area charts. This component is just an alias for [Line] with
the `area` prop set to `true`

```jsx
<Area
    line={(props) => <path {...props.lineProps} strokeWidth={3}/>}
    curve={(curves) => curves.curveMonotoneX}
/>
```


[Line]: /docs/renderable/Line

