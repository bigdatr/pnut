// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import {interpolateViridis} from 'd3-scale-chromatic';

import Line from '../src/component/canvas/Line';
import Scatter from '../src/component/canvas/Scatter';
import Column from '../src/component/canvas/Column';
import Axis from '../src/component/canvas/Axis';
import Chart from '../src/component/Chart';
import Svg from '../src/component/Svg';
import Interaction from '../src/component/Interaction';

import groupedSeries from '../src/series/groupedSeries';
import Series from '../src/series/Series';
import flatSeries from '../src/series/flatSeries';
import stack from '../src/process/stack';
import normalizeToPercentage from '../src/process/normalizeToPercentage';

import continuousScale from '../src/scale/continuousScale';
import categoricalScale from '../src/scale/categoricalScale';
import colorScale from '../src/scale/colorScale';
import dimensions from '../src/util/dimensions';
import {timeFormat} from 'd3-time-format';
import lineData from '../example/src/data/lineData';
//import columnData from '../example/src/data/columnData';


function App() {

    const dd = dimensions({width: 1000, height: 500, left: 50, bottom: 50});

    const data = lineData
        .flatMap(row => [
            {value: row.supply, type: 'supply', month: row.month},
            {value: row.supply, type: 'other', month: row.month},
            {value: row.demand, type: 'demand', month: row.month},
        ])
    ;
    const series = Series.group('type', 'month', data)
        .update(stack({key: 'value', type: 'columns'}))
        //.update(normalizeToPercentage({key: 'value'}))


    const x = continuousScale({series, column: 'month', range: dd.xRange});
    const y = continuousScale({series, column: 'value', range: dd.yRange});
    const radius = continuousScale({series, column: 'value', range: [1,4]});
    const color = colorScale({series, column: 'type', range: ['#ff1111', '#1111ff', '#11ff11']});



    const scales = {x, y, radius, color, series};

    return <Chart {...dd} style={{fontFamily: 'sans-serif'}}>
        <Axis scales={scales} position="bottom" textFormat={timeFormat('%b')} />
        <Axis scales={scales} position="left" />
        <Line scales={scales}  />
        <Scatter scales={scales}  />
    </Chart>;
}

// $FlowFixMe - Flow doesn't know that react dom has a render function
ReactDOM.render(<App />, document.getElementById('app'));
