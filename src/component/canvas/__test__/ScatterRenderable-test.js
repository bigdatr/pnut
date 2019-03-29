import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
import Scatter, {ScatterRenderable} from '../ScatterRenderable';
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
        supply: null,
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

const radiusScale = scaleLinear()
    .domain([chartData.min('demand'), chartData.max('demand')])
    .range([10, 30]);

const scaledData = chartData.rows.map(row => ({
    x: row['month'] != null ? xScale(row['month']) + xScale.bandwidth() / 2 : null,
    y: row['supply'] != null ? 200 - yScale(row['supply']) : null,
    radius: row['demand'] != null ? radiusScale(row['demand']) : null
}));

const DefaultScatter = (scaledData) => {
    return shallow(<ScatterRenderable
        width={200}
        height={200}
        scaledData={scaledData}
        data={chartData}
    />);
};

test('Default ScatterRenderable renders circles', () => {
    expect(DefaultScatter(scaledData).childAt(0).shallow().type()).toBe('circle');
});

test('ScatterRenderable won\'t render a dot for null points', () => {
    // The second data point won't be rendered because it has no supply value
    expect(DefaultScatter(scaledData).children().length).toBe(scaledData.length - 1);
});

test('ScatterRenderable won\'t render a dot for NaN points', () => {
    const scaledWithNaN = [...scaledData, {
        x: 100,
        y: NaN,
        radius: 30
    }];

    // Two points won't render now - one with a null, and one with a NaN value
    expect(DefaultScatter(scaledWithNaN).children().length).toBe(scaledWithNaN.length - 2);
});

const CustomScatter = shallow(<ScatterRenderable
    width={200}
    height={200}
    scaledData={scaledData}
    data={chartData}
    dot={(props) => <circle {...props.dotProps} r={props.dimensions.radius}/>}
/>);


test('ScatterRenderable allows custom circle rendering', () => {
    expect(CustomScatter.childAt(0).shallow().prop('r')).toBe(radiusScale(rows[0].demand));
});

test('ScatterRenderable custom dot has x and y params', () => {
    expect(CustomScatter.childAt(0).shallow().prop('cx')).toBe(xScale(rows[0].month));
    expect(CustomScatter.childAt(0).shallow().prop('cy')).toBe(200 - yScale(rows[0].supply));
});


test('Scatter renders a ScatterRenderable', () => {
    const canvas = shallow(<Scatter
        data={{}}
        width={200}
        height={200}
        scaledData={scaledData}
    />);
    expect(canvas.name()).toBe('ScatterRenderable');
});
