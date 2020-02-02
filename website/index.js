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
import {timeFormat} from 'd3-time-format';




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

function dimensions(pp = {}) {
    const {width = 0, height = 0, top = 0, bottom = 0, left = 0, right = 0} = pp;
    return {
        width: width - left - right,
        height: height - top - bottom,
        padding: {bottom, top, left, right}
    };
};

function App() {

    const {width, height, padding} = dimensions({width: 600, height: 400, left: 50, bottom: 50});

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



    const scales = {x: xColumns, y, radius, color, series};
    const columnScales = {
        color,
        x: xColumns,
        y,
        series: columnSeries
    };


        //<Line area={true} scales={scales} />
        //<Line scales={scales} />
    return <Chart padding={padding} width={width} height={height} style={{fontFamily: 'sans-serif'}}>
        <Column scales={columnScales} />
        <Axis scales={columnScales} position="bottom" textFormat={timeFormat('%x')} />
        <Axis scales={scales} position="left" />
        <Scatter scales={scales} />
    </Chart>;
}


// $FlowFixMe - Flow doesn't know that react dom has a render function
ReactDOM.render(<App />, document.getElementById('app'));
