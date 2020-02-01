// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import {interpolateViridis} from 'd3-scale-chromatic';

import Line from '../src/component/canvas/Line';
import Scatter from '../src/component/canvas/Scatter';
import Column from '../src/component/canvas/Column';
import Axis from '../src/component/canvas/Axis';
import ChartData from '../src/chartdata/ChartData';
import Chart from '../src/component/Chart';
import Svg from '../src/component/Svg';
import Interaction from '../src/component/Interaction';

import groupedSeries from '../src/series/groupedSeries';
import {stack} from '../src/series/groupedSeries';

import continuousScale from '../src/scale/continuousScale';
import categoricalScale from '../src/scale/categoricalScale';
import colorScale from '../src/scale/colorScale';




const data = [
    {spend: 0, type: 'foo', date: new Date('1970-01-01')},
    {spend: 20, type: 'foo', date: new Date('1970-01-02')},
    {spend: 40, type: 'foo', date: new Date('1970-01-03')},
    {spend: 70, type: 'foo', date: new Date('1970-01-04')},
    {spend: 90, type: 'foo', date: new Date('1970-01-05')},

    {spend: 10, type: 'bar', date: new Date('1970-01-01')},
    {spend: 30, type: 'bar', date: new Date('1970-01-02')},
    {spend: null, type: 'bar', date: new Date('1970-01-03')},
    {spend: 80, type: 'bar', date: new Date('1970-01-04')},
    {spend: 100, type: 'bar', date: new Date('1970-01-05')},
];


function App() {
    const width = 600;
    const height = 400;

    const columnSeries = groupedSeries({
        data,
        groupBy: x => x.date,
        process: stack({column: 'spend', type: 'inner'})
    });

    const series = groupedSeries({
        data,
        groupBy: x => x.type,
        process: stack({column: 'spend', type: 'outer'})
    });

    //console.log({columnSeries, series});

    const x = continuousScale({series, column: 'date', range: [0, width]});
    const y = continuousScale({series, column: 'spend', range: [height, 0]});
    const xColumns = categoricalScale({series, column: 'date', range: [0, width]});
    const radius = continuousScale({series, column: 'spend', range: [3, 3]});
    const color = colorScale({series, column: 'type', range: ['#ff1122aa', '#2211ffaa']});
    //const color = colorScale({series, column: 'spend', interpolate: interpolateViridis});



    const scales = {x, y, radius, color, series};
    const columnScales = {
        color,
        x: xColumns,
        y,
        series: columnSeries
    };


        //<Column scales={columnScales} />
    return <Svg style={{border: '1px solid'}} width={width} height={height}>
        <Line area={true} scales={scales} />
        <Scatter scales={scales} />
        <Interaction scales={scales} width={width} height={height} />
    </Svg>;
}


// $FlowFixMe - Flow doesn't know that react dom has a render function
ReactDOM.render(<App />, document.getElementById('app'));
