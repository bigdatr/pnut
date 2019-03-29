import React from 'react';
import Benchmark, {BenchmarkRenderable} from '../BenchmarkRenderable';
//import ChartData from '../../../chartdata/ChartData';
import {scaleLinear, scaleBand, scaleTime} from 'd3-scale';


const scale = scaleLinear()
    .domain([0,100])
    .range([0,200]);

const basicBenchmark = shallow(<BenchmarkRenderable
    yScale={scale}
    xScale={scale}
    location={50}
    width={200}
    height={200}
/>);

const basicInstance = basicBenchmark.instance();


//
// Line

test('getLengthProp will convert x|y to height|width', () => {
    expect(basicInstance.getLengthProp('y')).toBe('width');
    expect(basicInstance.getLengthProp('x')).toBe('height');
});

test('getPointPosition will return an array of x1,y1,x2,y2 values', () => {
    expect(basicInstance.getPointPosition('y', 0)).toEqual([0, 200, 200, 200]);
    expect(basicInstance.getPointPosition('y', 50)).toEqual([0, 100, 200, 100]);
    expect(basicInstance.getPointPosition('y', 100)).toEqual([0, 0, 200, 0]);

    expect(basicInstance.getPointPosition('x', 0)).toEqual([0, 0, 0, 200]);
    expect(basicInstance.getPointPosition('x', 50)).toEqual([100, 0, 100, 200]);
    expect(basicInstance.getPointPosition('x', 100)).toEqual([200, 0, 200, 200]);
});

test('will pass lineProps and xy values to Line component', () => {
    const wrapper = shallow(<BenchmarkRenderable
        yScale={scale}
        location={50}
        width={200}
        height={200}
        lineProps={{foo: 'bar'}}
    />)
    const props = wrapper.instance().drawLine().props;
    expect(props.x).toBe(0);
    expect(props.y).toBe(100);
    expect(props.lineProps.x1).toBe(0);
    expect(props.lineProps.x2).toBe(200);
    expect(props.lineProps.y1).toBe(100);
    expect(props.lineProps.y2).toBe(100);
    expect(props.lineProps.foo).toBe('bar');
});

//
// Text

test('will pass textProps and xy values to Text component', () => {
    const wrapper = shallow(<BenchmarkRenderable
        label="Foo Label"
        yScale={scale}
        location={50}
        labelOffset={[5,5]}
        width={200}
        height={200}
        textProps={{foo: 'bar'}}
    />)
    const props = wrapper.instance().drawText().props;
    expect(props.x).toBe(5);
    expect(props.y).toBe(105);
    expect(props.textProps.x).toBe(5);
    expect(props.textProps.y).toBe(105);
    expect(props.textProps.foo).toBe('bar');
});

test('x dimension text will be rotated 90deg', () => {
    const wrapper = shallow(<BenchmarkRenderable
        label="Foo Label"
        dimension="x"
        xScale={scale}
        location={50}
        width={200}
        height={200}
        textProps={{foo: 'bar'}}
    />)
    const props = wrapper.instance().drawText().props;
    expect(props.textProps.transform).toBe('rotate(90, 100, 0)');
});


// misc
test('Benchmark will pass props to BenchmarkRenderable', () => {
    const wrapper = shallow(<Benchmark
        foo="bar"
        yScale={scale}
        location={50}
        width={200}
        height={200}
    />);
    expect(wrapper.prop('foo')).toBe('bar');
    expect(wrapper.prop('dimension')).toBe('y');
});

test('DefaultText props', () => {
    const wrapper = shallow(<BenchmarkRenderable
        label="foo"
        yScale={scale}
        location={50}
        width={200}
        height={200}
    />);
    // g => Text => text => props
    const props = wrapper.find('g').children().at(0).dive().props();
    expect(props.children).toBe('foo');
    expect(props.stroke).toBe('none');
    expect(props.fontSize).toBe(12);
});

test('DefaultLine props', () => {
    const wrapper = shallow(<BenchmarkRenderable
        label="foo"
        yScale={scale}
        location={50}
        width={200}
        height={200}
    />);
    // g => Line => line => props
    const props = wrapper.find('g').children().at(1).dive().props();
    expect(props.stroke).toBe('inherit');
});
