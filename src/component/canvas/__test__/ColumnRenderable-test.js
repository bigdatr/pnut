import React from 'react';
import {scaleLog, scaleBand} from 'd3-scale';
import Column, {ColumnRenderable} from '../ColumnRenderable';
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
    },
    {
        demand: null,
        property_type: "Unknown",
        supply: null
    }
];


const chartData = new ChartData(rows, columns);

const yScale = scaleLog()
    .domain([chartData.min('supply'), chartData.max('supply')])
    .range([0, 100])
    .nice();

const xScale = scaleBand()
    .domain(rows.map(row => row.property_type))
    .range([0, 100]);

const scaledData = chartData.rows.map(row => ({
    x: row['property_type'] != null ? xScale(row['property_type']) + xScale.bandwidth() / 2 : null,
    y: row['supply'] != null ? 140 - yScale(row['supply']) : null
}));

const ColumnRenderableElement = shallow(<ColumnRenderable
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

test('ColumnRenderable applies passed columnProps to columns', () => {
    expect(ColumnRenderableElement.childAt(0).shallow().prop('fill')).toBe('blue');
});



test('ColumnRenderable errors out if both x and y scales are continuous', () => {
    const oldConsoleError = console.error;
    const newConsoleError = console.error = jest.fn();

    const BadColumnRenderableElement = shallow(<ColumnRenderable
        width={140}
        height={140}
        data={chartData}
        scaledData={scaledData}
        xScale={yScale}
        yScale={yScale}
        columnProps={{
            fill: 'blue'
        }}
    />);

    expect(newConsoleError).toHaveBeenCalled();
    expect(BadColumnRenderableElement.getElement()).toBe(null);

    console.error = oldConsoleError;
});



const ColumnElement = shallow(<Column
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

test('Column renders a ColumnRenderable', () => {
    expect(ColumnElement.at(0).name()).toBe('ColumnRenderable');
});



const BarElement = shallow(<Column
    width={140}
    height={140}
    data={chartData}
    scaledData={scaledData.map(row => ({x: row.y, y: row.x}))}
    xScale={yScale}
    yScale={xScale}
    columnProps={{
        fill: 'blue'
    }}
/>);

test('Column can render bar charts also', () => {
    const secondColumnProps = BarElement.at(0).shallow().childAt(1).prop('columnProps');

    // If this is a bar chart then columnProps x will be 0 for all columns and columnProps y will
    // be greater than 0 for all but the first column
    expect(secondColumnProps.x).toBe(0);
    expect(secondColumnProps.y > 0).toBe(true);
});

test('Column wont render columns with null values', () => {
    expect(ColumnElement.at(0).shallow().children().length).toBe(7);
});