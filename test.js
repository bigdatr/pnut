// @flow
import React from 'react';
import ReactDOM from 'react-dom';

import {Chart, Column, Series, CategoricalScale, ContinuousScale, ColorScale, Axis, layout} from './src/index';

function ColumnChart() {
    const data = [
        {fruit: 'apple', count: 20},
        {fruit: 'pears', count: 10},
        {fruit: 'strawberry', count: 30}
    ];

    // Define our series with day as the primary dimension
    const series = Series.single('fruit', data);

    // calculate chart width, height and palling
    const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

    // Set up scales to define our x,y and color
    const x = CategoricalScale({series, key: 'fruit', range: ll.xRange, palling: 0});
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
// $FlowFixMe - Flow doesn't know that react dom has a render function
ReactDOM.render(<ColumnChart />, document.getElementById('app'));
