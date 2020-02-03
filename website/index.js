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
import {stack} from '../src/series/groupedSeries';

import continuousScale from '../src/scale/continuousScale';
import categoricalScale from '../src/scale/categoricalScale';
import colorScale from '../src/scale/colorScale';
import dimensions from '../src/util/dimensions';
import {timeFormat} from 'd3-time-format';
import lineData from '../example/src/data/lineData';


function App() {

    const dd = dimensions({width: 800, height: 400, left: 50, bottom: 50});

    const data = lineData.flatMap(row => [
        {value: row.supply, type: 'supply', date: row.month},
        {value: row.demand, type: 'demand', date: row.month}
    ]);
    //const columnSeries = groupedSeries({
        //data,
        //groupBy: x => x.date,
        //process: stack({column: 'spend', type: 'inner'})
    //});

    const series = groupedSeries({
        data,
        groupBy: x => x.type,
        process: stack({column: 'value', type: 'outer'})

        //groupBy: x => x.date,
        //process: stack({column: 'value', type: 'inner'})
    });

    const x = categoricalScale({series, column: 'date', padding: 0.1, range: [0, dd.width]});
    const y = continuousScale({series, column: 'value', zero: true, range: [dd.height, 0]});
    const radius = continuousScale({series, column: 'value', range: [2, 10]});
    //const color = colorScale({series, column: 'type', range: ['#ff1122aa', '#2211ffaa']});
    const color = colorScale({series, column: 'value', interpolate: interpolateViridis});



    const scales = {x, y, radius, color, series};

    return <Chart {...dd} style={{fontFamily: 'sans-serif'}}>
        <Axis scales={scales} position="bottom" textFormat={timeFormat('%b')} />
        <Axis scales={scales} position="left" />
        <Column scales={scales} />
        <Interaction scales={scales} {...dd} fps={60}>
            {({items, position, nearestRow, nearestRowStepped}) => {
                const absX = Math.abs(position.x - x.scaleRow(nearestRow));
                const absY = Math.abs(position.y - y.scaleRow(nearestRow));
                const lineY = y.scaleRow(nearestRowStepped);
                //console.log({absX, absY});
                //return absX < 10 & absY < 10 && <text x={position.x} y={position.y}>{nearestRow.type}: {nearestRow.value}</text>;
                return nearestRowStepped && <>
                    <line stroke="black" x1={0} x2={dd.width} y1={lineY} y2={lineY} />
                    <text x={position.x} y={position.y}>{nearestRowStepped.type}: {nearestRowStepped.value}</text>
                </>;
            }}
        </Interaction>
    </Chart>;
}
        //{item && item.items.map(({x, y, row}) => <text key={row.value} x={x} y={y}>{row.type}: {row.value}</text>)}

        //{item && item.items.map(({x, y, row}) => <text key={row.value} x={x} y={y}>{row.type}: {row.value}</text>)}

// $FlowFixMe - Flow doesn't know that react dom has a render function
ReactDOM.render(<App />, document.getElementById('app'));
