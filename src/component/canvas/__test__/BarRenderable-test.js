import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {scaleLog, scaleBand} from 'd3-scale';
import Bar, {BarRenderable} from '../BarRenderable';
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
        key: 'property_type',
        label: 'Property Type',
        isContinuous: false
    }
];

const rows = [
    {
        demand: 2316,
        property_type: "Townhouse",
        supply: 312
    },
    {
        demand: 4487,
        property_type: "Villa",
        supply: 5
    },
    {
        demand: 1275,
        property_type: "Land",
        supply: 38
    },
    {
        demand: 707,
        property_type: "Apartment",
        supply: 264
    },
    {
        demand: 3681,
        property_type: "Unit",
        supply: 94
    },
    {
        demand: 4544,
        property_type: "House",
        supply: 2151
    },
    {
        demand: 2560,
        property_type: "Other",
        supply: 5
    }
];


const chartData = new ChartData(rows, columns);

const xScale = scaleLog()
    .domain([chartData.min('supply'), chartData.max('supply')])
    .range([0, 100])
    .nice();

const yScale = scaleBand()
    .domain(rows.map(row => row.property_type))
    .range([0, 100]);

const scaledData = chartData.rows.map(row => ({
    y: row.get('property_type') != null ? xScale(row.get('property_type')) + yScale.bandwidth() / 2 : null,
    x: row.get('supply') != null ? 140 - yScale(row.get('supply')) : null
})).toArray();

const BarElement = shallow(<Bar
    width={140}
    height={140}
    data={chartData}
    scaledData={scaledData}
    xScale={xScale}
    yScale={yScale}
    columnProps={{
        fill: 'blue'
    }}
/>);

test('Bar renders a ColumnRenderable', tt => {
    tt.is(BarElement.at(0).name(), 'ColumnRenderable');
});
