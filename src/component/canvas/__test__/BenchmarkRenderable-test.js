import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
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

test('getLengthProp will convert x|y to height|width', t => {
    t.is(basicInstance.getLengthProp('y'), 'width');
    t.is(basicInstance.getLengthProp('x'), 'height');
});

test('getPointPosition will return an array of x1,y1,x2,y2 values', t => {
    t.deepEqual(basicInstance.getPointPosition('y', 0), [0, 200, 200, 200]);
    t.deepEqual(basicInstance.getPointPosition('y', 50), [0, 100, 200, 100]);
    t.deepEqual(basicInstance.getPointPosition('y', 100), [0, 0, 200, 0]);

    t.deepEqual(basicInstance.getPointPosition('x', 0), [0, 0, 0, 200]);
    t.deepEqual(basicInstance.getPointPosition('x', 50), [100, 0, 100, 200]);
    t.deepEqual(basicInstance.getPointPosition('x', 100), [200, 0, 200, 200]);
});

test('will pass lineProps and xy values to Line component', t => {
    const wrapper = shallow(<BenchmarkRenderable
        yScale={scale}
        location={50}
        width={200}
        height={200}
        lineProps={{foo: 'bar'}}
    />)
    const props = wrapper.instance().drawLine().props;
    t.is(props.x, 0);
    t.is(props.y, 100);
    t.is(props.lineProps.x1, 0);
    t.is(props.lineProps.x2, 200);
    t.is(props.lineProps.y1, 100);
    t.is(props.lineProps.y2, 100);
    t.is(props.lineProps.foo, 'bar');
});

//
// Text

test('will pass textProps and xy values to Text component', t => {
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
    t.is(props.x, 5);
    t.is(props.y, 105);
    t.is(props.textProps.x, 5);
    t.is(props.textProps.y, 105);
    t.is(props.textProps.foo, 'bar');
});

test('x dimension text will be rotated 90deg', t => {
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
    t.is(props.textProps.transform, 'rotate(90, 100, 0)');
});


// misc
test('Benchmark will pass props to BenchmarkRenderable', t => {
    const wrapper = shallow(<Benchmark
        foo="bar"
        yScale={scale}
        location={50}
        width={200}
        height={200}
    />);
    t.is(wrapper.prop('foo'), 'bar');
    t.is(wrapper.prop('dimension'), 'y');
});

test('DefaultText props', t => {
    const wrapper = shallow(<BenchmarkRenderable
        label="foo"
        yScale={scale}
        location={50}
        width={200}
        height={200}
    />);
    // g => Text => text => props
    const props = wrapper.find('g').children().at(0).dive().props();
    t.is(props.children, 'foo');
    t.is(props.stroke, 'none');
    t.is(props.fontSize, 12);
});

test('DefaultLine props', t => {
    const wrapper = shallow(<BenchmarkRenderable
        label="foo"
        yScale={scale}
        location={50}
        width={200}
        height={200}
    />);
    // g => Line => line => props
    const props = wrapper.find('g').children().at(1).dive().props();
    t.is(props.stroke, 'inherit');
});
