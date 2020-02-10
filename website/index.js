// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import {schemeTableau10} from 'd3-scale-chromatic';

import Line from '../src/component/canvas/Line';
//import Scatter from '../src/component/canvas/Scatter';
//import Column from '../src/component/canvas/Column';
import Axis from '../src/component/canvas/Axis';
import Chart from '../src/component/Chart';
//import Interaction from '../src/component/Interaction';

import Series from '../src/series/Series';
//import stack from '../src/process/stack';
//import normalizeToPercentage from '../src/process/normalizeToPercentage';
//import binLongTail from '../src/process/binLongTail';

import continuousScale from '../src/scale/continuousScale';
import colorScale from '../src/scale/colorScale';
import dimensions from '../src/util/dimensions';
import {timeFormat} from 'd3-time-format';
import lineData from '../example/src/data/lineData';
//import columnData from '../example/src/data/columnData';


function App() {

    const dd = dimensions({width: 1000, height: 500, left: 50, bottom: 50});

    const data = lineData
        .flatMap(row => [
            {value: row.supply, type: 'supply', color: 'blue', month: row.month},
            //{value: row.supply * Math.random(), type: 'thing', color: 'green', month: row.month},
            //{value: row.supply * Math.random(), type: 'thing2', color: 'magenta', month: row.month},
            //{value: row.supply * Math.random(), type: 'thing3', color: 'orange', month: row.month},
            //{value: row.supply * Math.random(), type: 'thing4', color: 'cyan', month: row.month},
            //{value: row.supply * Math.random(), type: 'thing5', color: 'yellow', month: row.month},
            {value: row.demand, type: 'demand', color: 'red', month: row.month}
        ])
    ;
    const series = Series.group('type', 'month', data);
    //.update(normalizeToPercentage({key: 'value'}))
    //.update(binLongTail({
    //key: 'value',
    //threshold: 0.2,
    //accumulate: (rows) => {
    //let row = Object.assign({}, rows[0]);
    //row.color = '#ccc';
    //row.value = rows.r
    //row.binnedRows = rows;
    //return row;
    //}
    //}))
    //.update(stack({key: 'value'}))


    const x = continuousScale({series, key: 'month', range: dd.xRange, padding: 0});
    const y = continuousScale({series, key: 'value', range: dd.yRange, zero: true});
    const radius = continuousScale({series, key: 'value', range: [1,4]});
    const color = colorScale({series, key: 'type', range: schemeTableau10});



    const scales = {x, y, radius, color, series};

    return <Chart {...dd} style={{fontFamily: 'sans-serif'}}>
        <Axis scales={scales} position="bottom" textFormat={timeFormat('%b')} />
        <Axis scales={scales} position="left" />
        <Line scales={scales} stroke="white" />
    </Chart>;
}

// $FlowFixMe - Flow doesn't know that react dom has a render function
ReactDOM.render(<App />, document.getElementById('app'));
