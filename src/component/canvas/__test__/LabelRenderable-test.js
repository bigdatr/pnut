import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';

import {scaleLinear, scalePoint} from 'd3-scale';
import Label, {LabelRenderable} from '../LabelRenderable';
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


const scaledData = chartData.rows.map(row => ({
    x: row.get('month') != null ? xScale(row.get('month')) + xScale.bandwidth() / 2 : null,
    y: row.get('supply') != null ? 200 - yScale(row.get('supply')) : null
})).toArray();

const DefaultLabel = (scaledData: Array): React.Element<> => {
    return shallow(<LabelRenderable
        width={200}
        height={200}
        scaledData={scaledData}
        data={chartData}
        labelTextFromRow={row => row.get('month')}
    />);
};

test('Default LabelRenderable renders text', tt => {
    tt.is(DefaultLabel(scaledData).childAt(0).shallow().type(), 'text');
});

test('LabelRenderable won\'t render for null points', tt => {
    // The second data point won't be rendered because it has no supply value
    tt.is(DefaultLabel(scaledData).children().length, scaledData.length - 1);
});

test('LabelRenderable won\'t render text for NaN points', tt => {
    const scaledWithNaN = [...scaledData, {
        x: 100,
        y: NaN,
        radius: 30
    }];

    // Two points won't render now - one with a null, and one with a NaN value
    tt.is(DefaultLabel(scaledWithNaN).children().length, scaledWithNaN.length - 2);
});

const CustomLabel = shallow(<LabelRenderable
    width={200}
    height={200}
    scaledData={scaledData}
    data={chartData}
    labelTextFromRow={row => row.get('month')}
    label={(props) => <text {...props.labelProps} fill={'#ff0000'}/>}
/>);


test('LabelRenderable allows custom circle rendering', tt => {
    tt.is(CustomLabel.childAt(0).shallow().prop('fill'), '#ff0000');
});

test('LabelRenderable custom label has x and y params', tt => {
    console.log(CustomLabel.childAt(0).shallow());
    tt.is(CustomLabel.childAt(0).shallow().prop('x'), xScale(rows[0].month));
    tt.is(CustomLabel.childAt(0).shallow().prop('y'), 200 - yScale(rows[0].supply));
});


test('Label renders a LabelRenderable', tt => {
    const canvas = shallow(<Label
        data={{}}
        width={200}
        height={200}
        scaledData={scaledData}
    />);
    tt.is(canvas.name(), 'LabelRenderable');
});
