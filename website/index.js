// @flow
import React from 'react';
import ReactDOM from 'react-dom';

import Line from '../src/component/canvas/Line';
import Scatter from '../src/component/canvas/Scatter';
import Column from '../src/component/canvas/Column';
import Axis from '../src/component/canvas/Axis';
import ChartData from '../src/chartdata/ChartData';
import Chart from '../src/component/Chart';

import groupedSeries from '../src/series/groupedSeries';
import {stack} from '../src/series/groupedSeries';

import continuousScale from '../src/scale/continuousScale';




const data = new ChartData(
    [
        {spend: 0, type: 'foo', date: new Date('1970-01-01')},
        {spend: 10, type: 'bar', date: new Date('1970-01-01')},
        {spend: 20, type: 'foo', date: new Date('1970-01-02')},
        {spend: 30, type: 'bar', date: new Date('1970-01-02')},
        {spend: 40, type: 'foo', date: new Date('1970-01-03')},
        {spend: null, type: 'bar', date: new Date('1970-01-03')},
        {spend: 70, type: 'foo', date: new Date('1970-01-04')},
        {spend: 80, type: 'bar', date: new Date('1970-01-04')},
        {spend: 90, type: 'foo', date: new Date('1970-01-05')},
        {spend: 100, type: 'bar', date: new Date('1970-01-05')},
    ],
    [
        {key: 'foo'},
        {key: 'bar'},
        {key: 'date'}
    ]
);


function App() {
    const x = continuousScale({column: 'date'});
    const y = continuousScale({column: 'spend'});
    //const x = usea();
    //const y = useContinuous();
    //const line = useLine({x, y});
    //const useAxis = useLine({x, y});

    const series = groupedSeries({
        data: data.rows,
        groupBy: x => x.type,
        //process: stack({column: 'spend'})
    });


    console.log(series);

    const range = [0, 640];
    const inverseRange = range.slice().reverse();


    return <Svg width={1000} height={1000}>
        <Line scales={{x,y series}} />
    </Svg>;

    //const x = useStacked({data, columns: ['foo'], range});
    //const x = useStacked({data, columns: ['foo'], range});
    return <div>foo</div>;
    return <Chart
        width={1000}
        height={1000}
        padding={[64,65,128,64]}
        data={data}
        style={{stroke: '1px solid'}}
        dimensions={[
            {columns: ['date'], range},
            {columns: ['bar', 'foo'], range: inverseRange, stack: true},
            {columns: ['size'], range: [0, 3]},
        ]}
        children={([x,y, radius]) => <>
            <Column x={x} y={y} color={['#ca333391', '#6933ca91', '#ccc']}/>
            <Scatter x={x} y={y} radius={radius} color={['#ca333391', '#6933ca91', '#ccc']}/>
            <Axis x={x} y={y} position="bottom" dimension="x" />
            <Axis x={x} y={y} position="left" dimension="y" />
        </>}

    />;
}


// $FlowFixMe - Flow doesn't know that react dom has a render function
ReactDOM.render(<App />, document.getElementById('app'));
