import React from 'react';
import Gridline from '../Gridline';
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


const color = ['red', 'green', 'blue', 'yellow', 'purple'];

describe('ticks', () => {
    const [x,y] = useScales([
        {columns: ['baz'], range: [0, 1]},
        {columns: ['foo'], range: [0, 1]}
    ])(data);

    const gridlines = shallow(<Gridline x={x} y={y} />);

    it('renders gridlines', () => {
        const gridlines = render(<Gridline x={x} y={y} />);
        expect(gridlines.find('line').length).toBe(21);
    });

    it('defaults to scale.ticks() for continuous scales', () => {
        expect(gridlines.childAt(1).children().length).toBeGreaterThan(data.rows.length);
    });

    it('defaults to the domain for categorical scales', () => {
        expect(gridlines.childAt(0).children().length).toBe(data.rows.length);
    });

    it('lets you override the number of ticks with xTicks & yTicks', () => {
        const gridlines = shallow(<Gridline
             x={x}
             y={y}
             xTicks={() => [1]}
             yTicks={() => [1, 1]}
        />);
        expect(gridlines.childAt(0).children().length).toBe(1);
        expect(gridlines.childAt(1).children().length).toBe(2);
    });

});

describe('lines' , () => {
    const [x,y] = useScales([
        {columns: ['baz'], range: [0, 1]},
        {columns: ['foo'], range: [0, 1]}
    ])(data);


    it('will use xLine and yLine to override the default renderer', () => {
        expect.assertions(4)
        const gridlines = render(<Gridline
            x={x}
            y={y}
            xTicks={() => ['b']}
            yTicks={() => [30]}
            xLine={(props) => {
                expect(props.position).toEqual({x1: .2, x2: .2, y1: 0, y2: 1});
                return <g id="x">xLine!</g>
            }}
            yLine={(props) => {
                expect(props.position).toEqual({x1: 0, x2: 1, y1: 1, y2: 1});
                return <g id="y">yLine!</g>
            }}
        />);

        expect(gridlines.find('#x').text()).toBe('xLine!');
        expect(gridlines.find('#y').text()).toBe('yLine!');
    });

});

