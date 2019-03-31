import React from 'react';

import Svg from '../Svg';

test('Svg renders an svg element', () => {
    const canvas = shallow(<Svg/>);
    expect(canvas.type()).toBe('svg');
});

test('Svg renders an empty svg element when missing width or height', () => {
    const canvas = shallow(<Svg/>);
    expect(canvas.children().length).toBe(0);
});

test('Svg requires both width and height to be set to render children', () => {
    const canvas = shallow(<Svg width={100}/>);
    expect(canvas.children().length).toBe(0);
});

test('Svg renders children if width and height are set', () => {
    const canvas = shallow(<Svg width={100} height={100}><circle cx={0} cy={0} r={5}/></Svg>);
    expect(canvas.children().length).toBe(1);
    expect(canvas.childAt(0).type()).toBe('circle');
});

test('Svg sets width and height on svg element', () => {
    const canvas = shallow(<Svg width={100} height={100}><circle cx={0} cy={0} r={5}/></Svg>);
    const svg = canvas.getElement();
    expect(svg.props.width).toBe(100);
    expect(svg.props.height).toBe(100);
});
