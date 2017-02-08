import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';
import {spy} from 'sinon';

import Chart from '../Chart';
import Line from '../canvas/LineCanvas';
import ChartData from '../../chartdata/ChartData';

const columns = [
    {
        key: 'supply'
    },
    {
        key: 'month'
    },
    {
        key: 'demand'
    }
];

const rows = [
    {
        month: "2014-01-01",
        supply: 123605,
        demand: 280000
    },
    {
        month: "2014-02-01",
        supply: 457959,
        demand: 720000
    },
    {
        month: "2014-03-01",
        supply: 457959,
        demand: 720000
    }
];

const data = new ChartData(rows, columns);

test('Canvas.getCanvasSize props and padding default to 0', tt => {
    const chart = shallow(<Chart width={0} height={0} data={data} xDimension="demand"><Line yDimension="supply"/></Chart>);

    Object.values(chart.instance().getCanvasSize())
        .map(ii => {
            return tt.is(ii, 0);
        });
});

test('Canvas.getAxisSize returns correct padding for each combination', tt => {
    const chart = shallow(<Chart width={0} height={0} padding={[1,1,1,1]} data={data} xDimension="demand"><Line yDimension="supply"/></Chart>);
    tt.deepEqual(chart.instance().getAxisSize(), {});
    tt.is(chart.instance().getAxisSize('top').height, 1);
    tt.is(chart.instance().getAxisSize('bottom').height, 1);
    tt.is(chart.instance().getAxisSize('left').width, 1);
    tt.is(chart.instance().getAxisSize('right').width, 1);
});

test('Canvas.getDefaultScale will default to a linearScale with no range or domain', tt => {
    const chart = shallow(<Chart width={0} height={0} data={data} xDimension="demand"><Line yDimension="supply"/></Chart>).instance();
    tt.is(chart.getDefaultScale({})({})(1), 1);
});

test('if a scale is given a function it will be called with the scale and props', tt => {
    const scale = spy(scale => scale);
    shallow(<Chart width={0} height={0} data={data} xDimension="demand" xScale={scale}><Line yDimension="supply"/></Chart>).instance();
    tt.true(typeof scale.firstCall.args[0] === 'function');
    tt.true(typeof scale.firstCall.args[1] === 'object');
});

test('it puts axis types in thier spots', tt => {
    const scale = spy(scale => scale);

    function Axis() {
        return <g/>;
    }
    Axis.chartType = 'axis';

    const chart = shallow(<Chart width={0} height={0} data={data} xDimension="demand" xScale={scale}>
        <Line yDimension="supply"/>
        <Axis position="top" yDimension="supply" />
    </Chart>);

    tt.is(chart.children().at(0).children().at(0).name(), 'Axis');
    tt.is(chart.children().at(1).children().at(0).name(), 'Line');
});

test('mixing continuous and discreet data in scales will thrown an error', tt => {

    const chart = () => shallow(<Chart width={0} height={0} data={data} xDimension="demand">
        <Line yDimension="supply"/>
        <Line yDimension="month"/>
    </Chart>);

    tt.throws(chart);
});

test('discreet domains will be the length of the data inserted', tt => {
    const chart = () => shallow(<Chart width={0} height={0} data={data} xDimension="demand">
        <Line/>
    </Chart>);

    tt.throws(chart);
});

test('discreet domains will be the length of the data inserted', tt => {
    const scale = scale => tt.is(scale.domain().length, 3);

    shallow(<Chart width={0} height={0} data={data} xDimension="month" xScale={scale}>
        <Line yDimension="supply"/>
    </Chart>);
});


