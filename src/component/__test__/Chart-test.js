import React from 'react';
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

test('Chart.applyCanvasSize props and padding default to 0', () => {
    const chart = shallow(<Chart width={0} height={0} data={data} xColumn="demand"><Line yColumn="supply"/></Chart>);

    Object.values(chart.instance().applyCanvasSize({width: 0, height: 0}))
        .map(ii => {
            return expect(ii).toBe(0);
        });
});

test('Charts that are children will not return position offsets', () => {
    const chart = shallow(<Chart childChart width={0} height={0} data={data} xColumn="demand"><Line yColumn="supply"/></Chart>).instance();
    expect(chart.applyCanvasSize({width: 0, height: 0}).left).toBe(0);
    expect(chart.applyCanvasSize({width: 0, height: 0}).right).toBe(0);
    expect(chart.applyCanvasSize({width: 0, height: 0}).bottom).toBe(0);
    expect(chart.applyCanvasSize({width: 0, height: 0}).top).toBe(0);
});

test('Charts that are children will be padded in', () => {
    const chart = shallow(<Chart padding={[10,10,10,10]} width={100} height={100} data={data} xColumn="demand">
        <Chart/>
    </Chart>);
    expect(chart.childAt(0).props().width).toBe(80);
    expect(chart.childAt(0).props().height).toBe(80);
});



//
// scale updates

test('if a scaleUpdate is given a function it will be called with the scale and props', () => {
    const xScaleUpdate = (scale, props) => {
        expect(typeof scale).toBe('function');
        expect(typeof props).toBe('object');
        return scale;
    };
    shallow(<Chart width={0} height={0} data={data} xColumn="demand" xScaleUpdate={xScaleUpdate}><Line yColumn="supply"/></Chart>);
});

test('if a scaleTypeName is provided to a child the scale will be recalculated', () => {
    const CustomLine = (props) => {
        t.not(props.xScale.bandwidth);
        return <Line {...props} />;
    };
    shallow(<Chart width={0} height={0} data={data} xColumn="demand" ><CustomLine yColumn="supply" xScaleType="scalePoint" /></Chart>)
});

test('if a scaleUpdate is provided to a child the scale will be recalculated', () => {
    const xScaleUpdate = (scale, props) => {
        expect(typeof scale).toBe('function');
        expect(typeof props).toBe('object');
        return scale;
    };
    shallow(<Chart width={0} height={0} data={data} xColumn="demand" ><Line yColumn="supply" xScaleUpdate={xScaleUpdate}/></Chart>);
});


test('if a scaleUpdate is provided to a child the custom scale will be passed to the child renderable', () => {
    const chart = shallow(<Chart width={0} height={0} data={data} xColumn="month" >
        <Line yColumn="supply" xScaleUpdate={(scale) => scale.padding(0.1)}/>
    </Chart>);
    expect(chart.childAt(0).childAt(0).prop('xScale').padding()).toBe(0.1);
});

//
// multiple columns

test('if xColumn is an array then child components will receive x0, x1 in scaledData', () => {
    const chart = shallow(<Chart width={200} height={200} data={data} xColumn={["supply", "demand"]} >
        <Line yColumn="month" />
    </Chart>);

    expect(typeof chart.childAt(0).childAt(0).props().scaledData[0].x0).toBe('number');
    expect(typeof chart.childAt(0).childAt(0).props().scaledData[1].x1).toBe('number');
});


//
// misc

test('component will update dimensions and scaled data on componentWillReceiveProps', () => {
    const chart = shallow(<Chart width={0} height={0} data={data} xColumn="month">
        <Line yColumn="supply"/>
    </Chart>).instance();

    var old = chart.dimensions;
    chart.UNSAFE_componentWillReceiveProps(chart.props);
    expect(old).not.toBe(chart.dimensions);
});
