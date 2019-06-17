import React from 'react';
import Line from '../Line';
import ChartData from '../../../chartdata/ChartData';
import useScales from '../../../useScales';


const data = new ChartData(
    [
        {foo: 0, bar: 0, baz: 'a'},
        {foo: 10, bar: 1, baz: 'b'},
        {foo: null, bar: null, baz: 'c'},
        {foo: 20, bar: 2, baz: 'd'},
        {foo: 30, bar: 4, baz: 'e'},
    ],
    [
        {key: 'foo'},
        {key: 'bar'},
        {key: 'baz'}
    ]
);

const [x,y] = useScales([
    {columns: ['baz'], range: [0, 1]},
    {columns: ['foo', 'bar'], range: [0, 1]}
])(data);

describe('lines', () => {

    it('renders one line per column', () => {
        const lines = render(<Line x={x} y={y} />);
        expect(lines.find('path').length).toBe(2);
    });

    it('default line renders the color in stroke', () => {
        const chart = shallow(<Line x={x} y={y} color={['#foo']}/>).childAt(0).shallow();
        expect(chart).toHaveProp('stroke', '#foo');
        expect(chart).toHaveProp('fill', 'none');
    });

    it('colors fallback to #ccc', () => {
        const chart = shallow(<Line x={x} y={y} />).childAt(0).shallow();
        expect(chart).toHaveProp('stroke', '#ccc');
        expect(chart).toHaveProp('fill', 'none');
    });

    it('can render stacked lines', () => {
        // straight line chart data
        const data = new ChartData(
            [{foo: 1, bar: 2, baz: 1}, {foo: 1, bar: 2, baz: 2}],
            [{key: 'foo'}, {key: 'bar'}, {key: 'baz'}]
        );

        const [x,y] = useScales([
            {columns: ['baz'], range: [0, 300]},
            {columns: ['foo', 'bar'], range: [0, 300], stack: true}
        ])(data);

        const chart = shallow(<Line x={x} y={y} color={['#FFF']}/>);
        expect(chart.childAt(0).shallow()).toHaveProp('d', 'M0,100L300,100');
        expect(chart.childAt(1).shallow()).toHaveProp('d', 'M0,300L300,300');
    });

    it('will use Line to override the default renderer', () => {
        const lines = render(<Line
            x={x}
            y={y}
            line={(props) => <g className="line">Line</g>}
        />);

        expect(lines.find('.line').text()).toBe('LineLine');
    });

    it('will use props.curve to change the curve', () => {
        // fluctuating data for the curve to be prominent
        const data = new ChartData(
            [{foo: 1, bar: 1}, {foo: 100, bar: 2}, {foo: 1, bar: 3}],
            [{key: 'foo'}, {key: 'bar'}]
        );
        const [x,y] = useScales([
            {columns: ['bar'], range: [0, 1]},
            {columns: ['foo'], range: [0, 1]}
        ])(data);

        const aa = shallow(<Line x={x} y={y} curve={c => c.curveLinear} />).childAt(0);
        const bb = shallow(<Line x={x} y={y} curve={c => c.curveMonotoneX} />).childAt(0);

        expect(aa.prop('position').d).not.toBe(bb.prop('position').d);
    });

});

describe('areas', () => {
    const [x,y] = useScales([
        {columns: ['baz'], range: [0, 1]},
        {columns: ['foo', 'bar'], range: [0, 1]}
    ])(data);

    it('renders one area per column', () => {
        const chart = shallow(<Line x={x} y={y} area={true}/>);
        expect(chart.children().length).toBe(2);
        expect(chart.childAt(0).prop('position').d).toContain('Z');
    });

    it('default area renders the color in fill', () => {
        const chart = shallow(<Line x={x} y={y} area={true} color={['#FFF']}/>).childAt(0).shallow();
        expect(chart).toHaveProp('fill', '#FFF');
        expect(chart).toHaveProp('stroke', 'none');
    });

    it('can render stacked areas', () => {
        // straight line chart data
        const data = new ChartData(
            [{foo: 1, bar: 2, baz: 1}, {foo: 1, bar: 2, baz: 2}],
            [{key: 'foo'}, {key: 'bar'}, {key: 'baz'}]
        );

        const [x,y] = useScales([
            {columns: ['baz'], range: [0, 300]},
            {columns: ['foo', 'bar'], range: [0, 300], stack: true}
        ])(data);

        const chart = shallow(<Line x={x} y={y} area={true} color={['#FFF']}/>);
        expect(chart.childAt(0).shallow()).toHaveProp('d', 'M0,100L300,100L300,0L0,0Z');
        expect(chart.childAt(1).shallow()).toHaveProp('d', 'M0,300L300,300L300,100L0,100Z');
    });

});

