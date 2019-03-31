import React from 'react';
import {scaleLinear, scaleBand} from 'd3-scale';
import Gridlines, {GridlinesRenderable} from '../Gridlines';

const xScale = scaleLinear()
    .domain([0,100])
    .range([0,200]);

const yScale = scaleLinear()
    .domain([0,100])
    .range([0,200]);

const basicGridlinesRenderable = shallow(<GridlinesRenderable
    xScale={xScale}
    yScale={yScale}
    xTicks={scale => scale.ticks()}
    yTicks={scale => scale.ticks()}
/>);


test('GridlinesRenderable draws lines by default', () => {
    expect(basicGridlinesRenderable.childAt(0).childAt(0).shallow().type()).toBe('line');
});

const xScaleBand = scaleBand()
    .domain(['category 1', 'category 2'])
    .range([0, 200]);

const customGridlinesRenderable = shallow(<GridlinesRenderable
    xScale={xScaleBand}
    yScale={yScale}
    xTicks={() => ['category 1', 'category 2']}
    yTicks={scale => scale.ticks()}
    lineHorizontal={(props) => {
        const {coordinates, tick, scale} = props;
        return <line {...coordinates} strokeWidth="1" stroke="rgba(0,0,0,0.2)"/>
    }}
    lineVertical={(props) => {
        const {coordinates, tick} = props;
        return <rect x={coordinates.x1 - xScaleBand.bandwidth() / 2} y={coordinates.y1} width={xScaleBand.bandwidth()} height={coordinates.y2 - coordinates.y1} fill='rgba(0,0,0,0.1)'/>
    }}
/>);

test('GridlinesRenderable accepts a custom rect for vertical line', () => {
    expect(customGridlinesRenderable.childAt(1).childAt(0).shallow().type()).toBe('rect');
});

test('GridlinesRenderable accepts a custom line for horizontal line', () => {
    expect(customGridlinesRenderable.childAt(0).childAt(0).shallow().prop('stroke')).toBe('rgba(0,0,0,0.2)');
});

const withBandwidth = shallow(<GridlinesRenderable
    xScale={xScaleBand}
    yScale={xScaleBand}
    xTicks={() => ['category 1', 'category 2']}
    yTicks={() => ['category 1', 'category 2']}
/>);

test('GridlinesRenderable renders vertical line in middle of bandwidth', () => {
    expect(withBandwidth.childAt(1).childAt(0).shallow().prop('x1')).toBe(200 / 4);
});

test('GridlinesRenderable renders horizontal line in middle of bandwidth', () => {
    expect(withBandwidth.childAt(0).childAt(0).shallow().prop('y1')).toBe(200 - (200 / 4));
});

test('Gridlines renders a GridlinesRenderable', () => {
    const scale = scaleLinear().range([0,1]).domain([0,1]);
    const canvas = shallow(<Gridlines xScale={scale} yScale={scale} />);
    expect(canvas.name()).toBe('GridlinesRenderable');
});


test('GridlinesRenderable with discrete scales will use domain for ticks. Other will use ticks', () => {
    const linear = scaleLinear()
        .domain([0, 100])
        .range([0, 200]);

    const band = scaleBand()
        .domain(['category1', 'category2'])
        .range([0, 200]);

    const linearAxis = shallow(<GridlinesRenderable xScale={linear} yScale={linear}/>);
    const bandAxis = shallow(<GridlinesRenderable xScale={band} yScale={band}/>);

    expect(linearAxis.childAt(0).children().length).toBe(11);
    expect(bandAxis.childAt(0).children().length).toBe(2);

});
