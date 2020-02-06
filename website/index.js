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
import binLongTail from '../src/process/binLongTail';

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
            {value: row.supply, type: 'supply', color: 'blue', month: row.month},
            {value: row.supply * Math.random(), type: 'thing', color: 'green', month: row.month},
            {value: row.supply * Math.random(), type: 'thing2', color: 'magenta', month: row.month},
            {value: row.supply * Math.random(), type: 'thing3', color: 'orange', month: row.month},
            {value: row.supply * Math.random(), type: 'thing4', color: 'cyan', month: row.month},
            {value: row.supply * Math.random(), type: 'thing5', color: 'yellow', month: row.month},
            {value: row.demand, type: 'demand', color: 'red', month: row.month},
        ])
    ;
    const series = Series.group('type', 'month', data)
        //.update(normalizeToPercentage({key: 'value'}))
        .update(binLongTail({
            key: 'value',
            threshold: 0.1,
            accumulate: (rows) => {
                let row = Object.assign({}, rows[0]);
                row.color = '#ccc';
                row.value = rows.reduce((rr, ii) => rr + ii.value, 0);
                row.type = 'other';
                row.binnedRows = rows;
                //console.log(row);
                return row;
            }
        }))
        .update(stack({key: 'value', type: 'columns'}))


    const x = categoricalScale({series, column: 'month', range: dd.xRange, padding: 0.5});
    const y = continuousScale({series, column: 'value', range: dd.yRange});
    const radius = continuousScale({series, column: 'value', range: [1,4]});
    const color = colorScale({series, column: 'color'});



    const scales = {x, y, radius, color, series};

    return <Chart {...dd} style={{fontFamily: 'sans-serif'}}>
        <Axis scales={scales} position="bottom" textFormat={timeFormat('%b')} />
        <Axis scales={scales} position="left" />
        <Column scales={scales}  />
    </Chart>;
}

// $FlowFixMe - Flow doesn't know that react dom has a render function
ReactDOM.render(<App />, document.getElementById('app'));
