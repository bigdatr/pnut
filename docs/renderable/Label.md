---
title: Label
---

The Label component allows you to render a label on the chart canvas for each row in your ChartData.

## Props

### label
**type:** `Component<any>`
**default:** `<text />`

A custom React Component to use for the label. The default label is very bare-bones so it is likely you will want to customise with this.

```jsx
<Label label={({labelProps}) => <text {...labelProps} fill={'#ff0000'}></text>}/>
```



### labelProps
**type:** `{[key: string]: mixed}`
**default:** `{}`

Custom props to pass to the default label component. Useful if you just want minor customization.

```jsx
<Label labelProps={{fill: '#ff0000'}}/>
```


### labelOffset
**type:** `[number, number]`
**default:** `[0,0]`

x,y coordinate to offset the label by.

```jsx
// Will position the label above the point
<Label labelOffset={[0, -10]}/>
```

### labelTextFromRow
**type:** `(Immutable.Map) => string`

Getter function to create the label text from the ChartData row.

```jsx
<Label labelTextFromRow={row => row.get('label')}/>
```


## Examples


### With custom label
Description

```jsx

const label = (props) => {
    const offsetX = 20;
    const offsetY = -15;

    const {x, y} = props.labelProps;
    const [textX, textY] = [x + offsetX, y + offsetY];

    return <g>
        <line x1={x} y1={y + 2} x2={textX - 5} y2={textY - 5}/>
        <text
            {...props.labelProps}
            x={textX}
            y={textY}
            stroke={'#fff'}
            strokeWidth={4}
            fontSize={12}
            paintOrder={"stroke"}
        />
    </g>;
};

<Chart
    dimensions={['x', 'y']}
    data={data}
    xColumn={"month"}
    yColumn={"temperature"}
>
    <Axis dimension="x" textOrientation="vertical" position="bottom"/>
    <Axis dimension="y" position="left" />
    <Column />
    <Label labelTextFromRow={row => row.get('label')} label={label}/>
</Chart>;


```
