import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';

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

const canvas = shallow(<LineRenderable
    width={200}
    height={200}
    data={chartData}
    xScale={xScale}
    yScale={yScale}
    xColumn={'month'}
    yColumn={'supply'}
    data={chartData}
    pathProps={{
        strokeWidth: '2'
    }}
/>);

test('LineRenderable renders a line', tt => {
    tt.is(canvas.childAt(0).shallow().name(), 'path');
});

test('LineRenderable will use props.line instead of DefaultLine', tt => {
    const canvas = shallow(<LineRenderable
        width={200}
        height={200}
        data={chartData}
        xScale={xScale}
        yScale={yScale}
        xColumn={'month'}
        yColumn={'supply'}
        data={chartData}
        line={() => <div/>}
    />);

    tt.is(canvas.childAt(0).shallow().name(), 'div');
});

test('LineRenderable will offset the x position by half if the scale has a bandwidth', tt => {
    const props = {
        width: 140,
        height: 140,
        data: new ChartData([rows[0], rows[1]], [columns[0], columns[1]]),
        xScale: xScale,
        yScale: yScale,
        xColumn: 'demand',
        yColumn: 'supply'
    };
    const canvasLinear = shallow(<LineRenderable {...props} xScale={scaleLinear().domain(rows.map(row => row.demand)).range([0,100])}/>);
    const canvasBandwidth = shallow(<LineRenderable {...props} xScale={scalePoint().domain(rows.map(row => row.demand)).range([0,100])} />);
    const getD = (cc) => cc
        .childAt(0)
        .shallow()
        .prop('d')
        .split(' ')[4];

    tt.is(getD(canvasLinear), '100');
    tt.is(getD(canvasBandwidth), '3.225806451612903');
});

test('Line has a static chartType of canvas', tt => {
    tt.is(Line.chartType, 'canvas');
});

test('Line renders a LineRenderable', tt => {
    const canvas = shallow(<Line data={{}} xScale={() => undefined} yScale={() => undefined} xColumn="string" yColumn="string"/>);
    tt.is(canvas.name(), 'LineRenderable');
});

