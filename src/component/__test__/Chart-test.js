import test from 'ava';
import React from 'react';
import {Map} from 'immutable';
import {shallow} from 'enzyme';
import {spy} from 'sinon';

import Chart from '../Chart';
import Line from '../canvas/LineRenderable';
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

//
// canvas

test('Chart.applyCanvasSize props and padding default to 0', tt => {
    const chart = shallow(<Chart width={0} height={0} data={data} xColumn="demand"><Line yColumn="supply"/></Chart>);

    Object.values(chart.instance().applyCanvasSize({width: 0, height: 0}))
        .map(ii => {
            return tt.is(ii, 0);
        });
});

test('Charts that are children will not return position offsets', tt => {
    const chart = shallow(<Chart childChart width={0} height={0} data={data} xColumn="demand"><Line yColumn="supply"/></Chart>).instance();
    tt.is(chart.applyCanvasSize({width: 0, height: 0}).left, 0);
    tt.is(chart.applyCanvasSize({width: 0, height: 0}).right, 0);
    tt.is(chart.applyCanvasSize({width: 0, height: 0}).bottom, 0);
    tt.is(chart.applyCanvasSize({width: 0, height: 0}).top, 0);
});

test('Charts that are children will be padded in', tt => {
    const chart = shallow(<Chart padding={[10,10,10,10]} width={100} height={100} data={data} xColumn="demand">
        <Chart/>
    </Chart>);
    tt.is(chart.childAt(0).props().width, 80);
    tt.is(chart.childAt(0).props().height, 80);
});



//
// scale updates

test('if a scaleUpdate is given a function it will be called with the scale and props', tt => {
    const xScaleUpdate = (scale, props) => {
        tt.is(typeof scale, 'function');
        tt.is(typeof props, 'object');
        return scale;
    };
    shallow(<Chart width={0} height={0} data={data} xColumn="demand" xScaleUpdate={xScaleUpdate}><Line yColumn="supply"/></Chart>);
});

test('if a scaleTypeName is provided to a child the scale will be recalculated', tt => {
    const CustomLine = (props) => {
        tt.not(props.xScale.bandwidth);
        return <Line {...props} />;
    };
    shallow(<Chart width={0} height={0} data={data} xColumn="demand" ><CustomLine yColumn="supply" xScaleType="scalePoint" /></Chart>)
});

test('if a scaleUpdate is provided to a child the scale will be recalculated', tt => {
    const xScaleUpdate = (scale, props) => {
        tt.is(typeof scale, 'function');
        tt.is(typeof props, 'object');
        return scale;
    };
    shallow(<Chart width={0} height={0} data={data} xColumn="demand" ><Line yColumn="supply" xScaleUpdate={xScaleUpdate}/></Chart>);
});


test('if a scaleUpdate is provided to a child the custom scale will be passed to the child renderable', tt => {
    const chart = shallow(<Chart width={0} height={0} data={data} xColumn="month" >
        <Line yColumn="supply" xScaleUpdate={(scale) => scale.padding(0.1)}/>
    </Chart>);
    tt.is(chart.childAt(0).childAt(0).prop('xScale').padding(), 0.1);
});

//
// misc

test('component will update dimensions and scaled data on componentWillReceiveProps', tt => {
    const chart = shallow(<Chart width={0} height={0} data={data} xColumn="month">
        <Line yColumn="supply"/>
    </Chart>).instance();

    var old = chart.dimensions;
    chart.componentWillReceiveProps(chart.props);
    tt.not(old, chart.dimensions);
});


