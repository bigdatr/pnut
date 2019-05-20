// @flow
import React from 'react';
import ReactDOM from 'react-dom';

import Line from '../src/component/canvas/Line';
import Scatter from '../src/component/canvas/Scatter';
import Axis from '../src/component/canvas/Axis';
import ChartData from '../src/chartdata/ChartData';
import Chart from '../src/component/Chart';



const data = new ChartData(
    [
        {foo: 0, bar: 0, date: new Date('1970-01-01')},
        {foo: 10, bar: 1, date: new Date('1970-01-02')},
        {foo: 20, bar: 2, date: new Date('1970-01-03')},
        {foo: 30, bar: 4, date: new Date('1970-01-04')},
        {foo: 40, bar: 8, date: new Date('1970-01-05')},
        {foo: 50, bar: 16, date: new Date('1970-01-06')},
        {foo: null, bar: null, date: new Date('1970-01-07')},
        {foo: 70, bar: 64, date: new Date('1970-01-08')},
        {foo: 80, bar: 128, date: new Date('1970-01-09')},
        {foo: 90, bar: 256, date: new Date('1970-01-10')},
        {foo: 100, bar: 512, date: new Date('1970-01-11')}
    ],
    [
        {key: 'foo'},
        {key: 'bar'},
        {key: 'date'}
    ]
);


function App() {
    return <Chart
        width={1000}
        height={1000}
        padding={[64,65,128,64]}
        data={data}
        style={{stroke: '1px solid'}}
        dimensions={[
            {columns: ['foo'], range: [0, 640]},
            {columns: ['bar', 'foo'], range: [640, 0], stack: true}
        ]}
        children={([x,y]) => <>
            <Line x={x} y={y} area={true} color={['#ca333391', '#6933ca91', '#ccc']}/>
            <Scatter x={x} y={y} color={['#ca333391', '#6933ca91', '#ccc']}/>
            <Axis x={x} y={y} position="bottom" dimension="x" />
            <Axis x={x} y={y} position="left" dimension="y" />
        </>}

    />;
}


// $FlowFixMe - Flow doesn't know that react dom has a render function
ReactDOM.render(<App />, document.getElementById('app'));
