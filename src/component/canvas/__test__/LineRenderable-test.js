import React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {scaleLinear, scalePoint} from 'd3-scale';
import Line, {LineRenderable} from '../LineRenderable';
import ChartData from '../../../chartdata/ChartData';


const columns = [
    {
        key: 'supply',
        label: 'Supply',
        isContinuous: true
    },
    {
        key: 'demand',
        label: 'Demand',
        isContinuous: true
    },
    {
        key: 'month',
        label: 'Month',
        isContinuous: false
    }
];

const rows = [
    {
        month: "2014-01-01",
        supply: 123605,
        demand: 28
    },
    {
        month: "2014-02-01",
        supply: 457959,
        demand: 72
    },
    {
        month: "2014-03-01",
        supply: 543558,
        demand: 96
    },
    {
        month: "2014-04-01",
        supply: 657625,
        demand: 107
    },
    {
        month: "2014-05-01",
        supply: 724687,
        demand: 116
    },
    {
        month: "2014-06-01",
        supply: 577673,
        demand: 93
    },
    {
        month: "2014-07-01",
        supply: 510476,
        demand: 85
    },
    {
        month: "2014-08-01",
        supply: 587977,
        demand: 104
    },
    {
        month: "2014-09-01",
        supply: 589351,
        demand: 121
    },
    {
        month: "2014-10-01",
        supply: 557710,
        demand: 138
    },
    {
        month: "2014-11-01",
        supply: 550750,
        demand: 139
    },
    {
        month: "2014-12-01",
        supply: 240661,
        demand: 95
    },
    {
        month: "2015-01-01",
        supply: 278804,
        demand: 87
    },
    {
        month: "2015-02-01",
        supply: 785962,
        demand: 141
    },
    {
        month: "2015-03-01",
        supply: 713841,
        demand: 129
    },
    {
        month: "2015-04-01",
        supply: 681580,
        demand: 132
    },
    {
        month: "2015-05-01",
        supply: 930395,
        demand: 139
    },
    {
        month: "2015-06-01",
        supply: 937566,
        demand: 109
    },
    {
        month: "2015-07-01",
        supply: 1011621,
        demand: 126
    },
    {
        month: "2015-08-01",
        supply: 1638135,
        demand: 154
    },
    {
        month: "2015-09-01",
        supply: 1209174,
        demand: 138
    },
    {
        month: "2015-10-01",
        supply: 1060541,
        demand: 137
    },
    {
        month: "2015-11-01",
        supply: 1236615,
        demand: 170
    },
    {
        month: "2015-12-01",
        supply: 629503,
        demand: 125
    },
    {
        month: "2016-01-01",
        supply: 678891,
        demand: 109
    },
    {
        month: "2016-02-01",
        supply: 1681174,
        demand: 163
    },
    {
        month: "2016-03-01",
        supply: 1209983,
        demand: 140
    },
    {
        month: "2016-04-01",
        supply: 1380393,
        demand: 149
    },
    {
        month: "2016-05-01",
        supply: 1267107,
        demand: 151
    },
    {
        month: "2016-06-01",
        supply: 1371218,
        demand: 154
    },
    {
        month: "2016-07-01",
        supply: 1652395,
        demand: 160
    },
    {
        month: "2016-08-01",
        supply: 1561521,
        demand: 181
    },
    {
        month: "2016-09-01",
        supply: 1896226,
        demand: 218
    },
    {
        month: "2016-10-01",
        supply: 1810362,
        demand: 227
    },
    {
        month: "2016-11-01",
        supply: 1877047,
        demand: 247
    },
    {
        month: "2016-12-01",
        supply: 770154,
        demand: 204
    }
];

const chartData = new ChartData(rows, columns);

const yScale = scaleLinear()
    .domain([chartData.min('supply'), chartData.max('supply')])
    .range([0, 100])
    .nice();

const xScale = scalePoint()
    .domain(rows.map(row => row.month))
    .range([0, 100]);

const scaledData = chartData.rows.map(row => ({
    x: row.get('month') != null ? xScale(row.get('month')) + xScale.bandwidth() / 2 : null,
    y: row.get('supply') != null ? 140 - yScale(row.get('supply')) : null
})).toArray();


const LineElement = shallow(<LineRenderable
    width={200}
    height={200}
    data={chartData}
    scaledData={scaledData}
    xScale={xScale}
    yScale={yScale}
    lineProps={{
        strokeWidth: '2'
    }}
/>);

test('LineRenderable renders a svg path element', tt => {
    tt.is(LineElement.childAt(0).shallow().name(), 'path');
});

test('LineRenderable will use props.line instead of DefaultLine', tt => {
    const LineElement = shallow(<LineRenderable
        width={200}
        height={200}
        data={chartData}
        scaledData={scaledData}
        xScale={xScale}
        yScale={yScale}
        lineProps={{
            strokeWidth: '2'
        }}
        line={() => <div/>}
    />);

    tt.is(LineElement.childAt(0).shallow().name(), 'div');
});

test('LineRenderable allows custom curves', tt => {
    const LinearLineElement = shallow(<LineRenderable
        width={200}
        height={200}
        data={chartData}
        scaledData={scaledData}
        xScale={xScale}
        yScale={yScale}
        lineProps={{
            strokeWidth: '2'
        }}
    />);

    const MonotoneLineElement = shallow(<LineRenderable
        width={200}
        height={200}
        data={chartData}
        scaledData={scaledData}
        xScale={xScale}
        yScale={yScale}
        lineProps={{
            strokeWidth: '2'
        }}
        curveSelector={curves => curves.curveMonotoneX}
    />);

    tt.true(LinearLineElement.childAt(0).prop('lineProps').d !== MonotoneLineElement.childAt(0).prop('lineProps').d);
});



test('LineRenderable can also render area charts', tt => {
    const AreaElement = shallow(<LineRenderable
        width={200}
        height={200}
        data={chartData}
        scaledData={scaledData}
        xScale={xScale}
        yScale={yScale}
        area={true}
        lineProps={{
            strokeWidth: '2'
        }}
    />);

    const areaPath = AreaElement.childAt(0).prop('lineProps').d;

    tt.is(areaPath[areaPath.length - 1], 'Z')
});

test('Line has a static chartType of canvas', tt => {
    tt.is(Line.chartType, 'canvas');
});

test('Line renders a LineRenderable', tt => {
    const canvas = shallow(<Line
            data={{}}
            xScale={() => undefined}
            scaledData={scaledData}
            yScale={() => undefined}
            height={100}
            width={100}
        />);
    tt.is(canvas.name(), 'LineRenderable');
});

