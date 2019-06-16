import React from 'react';
import Axis from '../Axis';
import ChartData from '../../../chartdata/ChartData';
import useScales from '../../../useScales';

const data = new ChartData(
    [
        {foo: 5, bar: 0, baz: 'a'},
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

describe('ticks', () => {

    const [x,y] = useScales([
        {columns: ['baz'], range: [0, 1]},
        {columns: ['foo'], range: [0, 1]}
    ])(data);

    it('gives the scale to props.ticks', () => {
        const scale = jest.fn();
        const ticks = jest.fn(() => []);

        const [x,y] = useScales([
            {columns: ['baz'], range: [0, 1]},
            {columns: ['foo'], range: [0, 1], updateScale: () => scale}
        ])(data);

        const axis = shallow(<Axis x={x} y={y} position="left" ticks={ticks} />);

        expect(ticks).toHaveBeenCalledWith(scale);
    });

    it('renders one tick per item returned from props.ticks', () => {
        const ticks = jest.fn(() => [1,2,3]);
        const axis = shallow(<Axis x={x} y={y} position="left" ticks={ticks} />);
        expect(axis.childAt(1).children().length).toBe(3);
    });

    it('can override the default Tick with props.tickLine ', () => {
        const customTickLine = () => {};
        const tickLine = shallow(<Axis x={x} y={y} position="left" tickLine={customTickLine} />)
            .childAt(1).childAt(0).childAt(0);

        expect(tickLine.text()).toBe('<customTickLine />');
        expect(tickLine.props()).toEqual({
            index: 0,
            axisPosition: 'left',
            size: 6,
            position: {
                x1: -0.5,
                x2: -6.5,
                y1: 0.04,
                y2: 0.04
            }
        });
    });

    it('gives position to tickLine based on tickSize', () => {
        const normal = shallow(<Axis x={x} y={y} position="left" tickSize={10} />)
            .childAt(1).childAt(0).childAt(0);

        const large = shallow(<Axis x={x} y={y} position="left" />)
            .childAt(1).childAt(0).childAt(0);

        expect(normal.prop('position')).not.toEqual(large.prop('position'));
    });

    it('default renders a tickLine with stroke #ccc', () => {
        const defaultTickLine = shallow(<Axis x={x} y={y} position="left" />)
            .childAt(1).childAt(0).childAt(0).shallow();

        expect(defaultTickLine.prop('stroke')).toBe('#ccc');
    });

});

describe('text', () => {

    const [x,y] = useScales([
        {columns: ['baz'], range: [0, 1]},
        {columns: ['foo'], range: [0, 1]}
    ])(data);

    it('can override the default text with props.text ', () => {
        const customText = (props) => {};
        const axis = shallow(<Axis x={x} y={y} position="left" text={customText} />);
        const text = axis.childAt(1).childAt(0).childAt(1);

        expect(text.text()).toBe('<customText />');
        expect(text.props()).toEqual({
            index: 0,
            position: {
                children: 6,
                dominantBaseline: 'middle',
                textAnchor: 'end',
                x: -12.5,
                y: 0.04
            }
        });
    });

    it('passes each value through props.textFormat', () => {
        const axis = shallow(<Axis x={x} y={y} position="left" textFormat={(value) => value + '!'} />);
        const text = axis.childAt(1).childAt(0).childAt(1);

        expect(text.prop('position').children).toBe('6!');
    });

    it('positions text with props.textPadding', () => {
        const padded = shallow(<Axis x={x} y={y} position="left" />)
            .childAt(1).childAt(0).childAt(1);

        const plain = shallow(<Axis x={x} y={y} position="left" textPadding={10} />)
            .childAt(1).childAt(0).childAt(1);

        expect(plain.prop('position')).not.toEqual(padded.prop('position'));
    });

    it('default renders a text with size 12 and no stroke', () => {
        const defaultText = shallow(<Axis x={x} y={y} position="left" />)
            .childAt(1).childAt(0).childAt(1).shallow();

        expect(defaultText.prop('fontSize')).toBe(12);
        expect(defaultText.prop('stroke')).toBe('none');
    })

});

describe('line', () => {
    const [x,y] = useScales([
        {columns: ['baz'], range: [0, 1]},
        {columns: ['foo'], range: [0, 1]}
    ])(data);

    const run = (position, location) => {
        return shallow(<Axis x={x} y={y} position={position} location={location} />)
            .childAt(0)
            .childAt(0);
    };

    it('will render a line based on props.position', () => {
        expect(run('left').prop('position')).toEqual({x1: 0, x2: 0, y1: -0, y2: 1});
        expect(run('right').prop('position')).toEqual({x1: 1, x2: 1, y1: -0, y2: 1});
        expect(run('top').prop('position')).toEqual({x1: -0, x2: 1, y1: 0, y2: 0});
        expect(run('bottom').prop('position')).toEqual({x1: -0, x2: 1, y1: 1, y2: 1});
    });

    it('will throw error if bad position is passed', () => {
        expect(() => shallow(<Axis x={x} y={y} position="blah" />))
            .toThrow('unknown position: blah');
    });

    it('can render at a location in the domain', () => {
        expect(run('left', 'a').prop('position')).toEqual({x1: 0, x2: 0, y1: -0, y2: 1});
        expect(run('right', 'a').prop('position')).toEqual({x1: 0, x2: 0, y1: -0, y2: 1});
        expect(run('top', 17.5).prop('position')).toEqual({x1: -0, x2: 1, y1: .5, y2: .5});
        expect(run('bottom', 17.5).prop('position')).toEqual({x1: -0, x2: 1, y1: .5, y2: .5});
    });

    it('can overlap axis with props.overlap', () => {
        const axis = shallow(<Axis x={x} y={y} position="left" overlap={10} />);

        expect(axis.childAt(0).childAt(0).props()).toEqual({
            position: {x1: 0, x2: 0, y1: -10, y2: 11}
        });
    });

    it('can override the default AxisLine with props.axisLine', () => {
        const customAxisLine = (props) => {};
        const axis = shallow(<Axis x={x} y={y} position="left" axisLine={customAxisLine} />);

        expect(axis.childAt(0).text()).toBe('<customAxisLine />');
        expect(axis.childAt(0).childAt(0).props()).toEqual({
            position: {x1: 0, x2: 0, y1: -0, y2: 1}
        });
    });

    it('default renders a axisTickLine with color #ccc and width of 1', () => {
        const defaultAxisLine = shallow(<Axis x={x} y={y} position="left" />)
            .childAt(0).childAt(0).shallow()

        expect(defaultAxisLine.prop('stroke')).toBe('#ccc');
        expect(defaultAxisLine.prop('strokeWidth')).toBe(1);
    });

});

