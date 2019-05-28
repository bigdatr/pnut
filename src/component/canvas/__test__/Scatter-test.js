import React from 'react';
import Scatter from '../Scatter';
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

describe('dots', () => {
    const [x,y] = useScales([
        {columns: ['baz'], range: [0, 1]},
        {columns: ['foo'], range: [0, 1]}
    ])(data);


    it('renders one dot per numerical data point', () => {
        const dots = render(<Scatter x={x} y={y} />);
        expect(dots.find('circle').length).toBe(4);
        expect(dots.find('circle').length).toBeLessThan(data.rows.length);
    });

    it('can render stacked dots', () => {
        const [x,y] = useScales([
            {columns: ['baz'], range: [0, 1]},
            {columns: ['foo', 'bar'], range: [0, 1], stack: true}
        ])(data);
        const dots = shallow(<Scatter x={x} y={y} />).children();
        expect(dots.length).toBe(8);
    });

    it('will use Dot to override the default renderer', () => {
        expect.assertions(1)
        const dots = render(<Scatter
            x={x}
            y={y}
            Dot={(props) => {
                return <g className="dot">Dot</g>;
            }}
        />);

        expect(dots.find('.dot').text()).toBe('DotDotDotDot');
    });


});

