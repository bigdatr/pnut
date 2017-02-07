import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';

import {scaleLog, scaleBand} from 'd3-scale';
import Column, {ColumnCanvas} from '../ColumnCanvas';
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

const yScale = scaleLog()
    .domain([chartData.min(['supply', 'demand']), chartData.max(['supply', 'demand'])])
    .range([0, 100])
    .nice();

const xScale = scaleBand()
    .domain(rows.map(row => row.property_type))
    .range([0, 100]);

const canvas = shallow(<ColumnCanvas
    width={140}
    height={140}
    data={chartData}
    xScale={xScale}
    yScale={yScale}
    xDimension={'property_type'}
    yDimension={['supply', 'demand']}
    columnProps={{
        fill: 'blue'
    }}
/>);

test('ColumnCanvas renders multiple columns', tt => {
    tt.is(canvas.children().length, rows.length * 2);
});

test('ColumnCanvas applies passed columnProps to columns', tt => {
    tt.is(canvas.children().at(0).prop('fill'), 'blue');
});

test('ColumnCanvas given a single yDimension as a string will divide the width by 1', tt => {
    const canvas = shallow(<ColumnCanvas
        width={140}
        height={140}
        data={chartData}
        xScale={xScale}
        yScale={yScale}
        xDimension={'property_type'}
        yDimension={'supply'}
        columnProps={{
            fill: 'blue'
        }}
    />);
    // console.log(canvas.children().at(0).prop('width'));
    tt.is(canvas.children().at(0).prop('width'), 14.285714285714286);
});

test('Column has a static chartType of canvas', tt => {
    tt.is(Column.chartType, 'canvas');
});

test('Column renders a ColumnCanvas', tt => {
    const canvas = shallow(<Column data={{}} xScale={() => undefined} yScale={() => undefined} xDimension="string" yDimension="string"/>);
    tt.is(canvas.name(), 'ColumnCanvas');
});
