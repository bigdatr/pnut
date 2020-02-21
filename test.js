// @flow
import React from 'react';
import ReactDOM from 'react-dom';

import {Chart, Scatter, Series, ContinuousScale, ColorScale, Axis, layout} from './src/index';

function BubbleChart() {
    const data = [
        {day: 1, size: 200, value: 0},
        {day: 2, size: 800, value: 10},
        {day: 3, size: 900, value: 20},
        {day: 4, size: 200, value: 15},
        {day: 5, size: 300, value: 200},
        {day: 6, size: 400, value: 100},
        {day: 7, size: 300, value: 20}
    ];

    // Define our series with day as the primary dimension
    const series = Series.group('type', 'day', data);

    // calculate chart width, height and palling
    const ll = layout({width: 400, height: 400, left: 32, bottom: 32});

    // Set up scales to define our x, y and color
    const x = ContinuousScale({series, key: 'day', range: ll.xRange});
    const y = ContinuousScale({series, key: 'value', range: ll.yRange});
    const radius = ContinuousScale({series, key: 'size', range: [2, 10]});
    const color = ColorScale({series, key: 'type', set: ['orange']});


    // create a scales object for each of our renderable components
    const scales = {series, x, y, radius, color};

    // render a chart with two axis and a line
    return <Chart {...ll}>
        <Axis scales={scales} position="left" />
        <Axis scales={scales} position="bottom" />
        <Scatter scales={scales} strokeWidth="2" />
    </Chart>;
}

// $FlowFixMe - Flow doesn't know that react dom has a render function
ReactDOM.render(<BubbleChart />, document.getElementById('app'));
