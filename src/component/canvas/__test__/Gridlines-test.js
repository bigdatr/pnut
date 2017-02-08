import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';
import {scaleLinear, scaleBand} from 'd3-scale';
import Gridlines from '../Gridlines';

const scaleX = scaleLinear()
    .domain([0,100])
    .range([0,200]);

const scaleY = scaleLinear()
    .domain([0,100])
    .range([0,200]);

const basicGridlines = shallow(<Gridlines
    scaleX={scaleX}
    scaleY={scaleY}
    ticksX={scaleX.ticks()}
    ticksY={scaleY.ticks()}
/>);


test('Gridlines draws lines by default', tt => {
    tt.is(basicGridlines.childAt(0).childAt(0).shallow().type(), 'line');
});

const scaleXBand = scaleBand()
    .domain(['category 1', 'category 2'])
    .range([0, 200]);

const customGridlines = shallow(<Gridlines
    scaleX={scaleXBand}
    scaleY={scaleY}
    ticksX={['category 1', 'category 2']}
    ticksY={scaleY.ticks()}
    lineHorizontal={(props) => {
        const {coordinates, tick, scale} = props;
        return <line {...coordinates} strokeWidth="1" stroke="rgba(0,0,0,0.2)"/>
    }}
    lineVertical={(props) => {
        const {coordinates, tick} = props;
        return <rect x={coordinates.x1 - scaleXBand.bandwidth() / 2} y={coordinates.y1} width={scaleXBand.bandwidth()} height={coordinates.y2 - coordinates.y1} fill='rgba(0,0,0,0.1)'/>
    }}
/>);

test('Gridlines accepts a custom rect for vertical line', tt => {
    tt.is(customGridlines.childAt(1).childAt(0).shallow().type(), 'rect');
});

test('Gridlines accepts a custom line for horizontal line', tt => {
    tt.is(customGridlines.childAt(0).childAt(0).shallow().prop('stroke'), 'rgba(0,0,0,0.2)');
});

const withBandwidth = shallow(<Gridlines
    scaleX={scaleXBand}
    scaleY={scaleXBand}
    ticksX={['category 1', 'category 2']}
    ticksY={['category 1', 'category 2']}
/>);

test('Gridlines renders vertical line in middle of bandwidth', tt => {
    tt.is(withBandwidth.childAt(1).childAt(0).shallow().prop('x1'), 200 / 4);
});

test('Gridlines renders horizontal line in middle of bandwidth', tt => {
    tt.is(withBandwidth.childAt(0).childAt(0).shallow().prop('y1'), 200 - (200 / 4));
});