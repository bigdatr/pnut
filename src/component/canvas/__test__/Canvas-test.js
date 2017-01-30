import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';

import Canvas from '../Canvas';

test('Canvas renders a svg element', tt => {
    const canvas = shallow(<Canvas/>);
    tt.is(canvas.type(), 'svg');
});

test('Canvas renders an empty svg element when missing width or height', tt => {
    const canvas = shallow(<Canvas/>);
    tt.is(canvas.children().length, 0);
});

test('Canvas requires both width and height to be set to render children', tt => {
    const canvas = shallow(<Canvas width={100}/>);
    tt.is(canvas.children().length, 0);
});

test('Canvas renders children if width and height are set', tt => {
    const canvas = shallow(<Canvas width={100} height={100}><circle cx={0} cy={0} r={5}/></Canvas>);
    tt.is(canvas.children().length, 1);
    tt.is(canvas.childAt(0).type(), 'circle');
});

test('Canvas sets width and height on svg element', tt => {
    const canvas = shallow(<Canvas width={100} height={100}><circle cx={0} cy={0} r={5}/></Canvas>);
    const svg = canvas.getNode();
    tt.is(svg.props.width, 100);
    tt.is(svg.props.height, 100);
});