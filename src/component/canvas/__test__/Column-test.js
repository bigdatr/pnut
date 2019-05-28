import React from 'react';
import Column from '../Column';
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

describe('basics', () => {

    it('renders in g tag', () => {
        const [x,y] = useScales([
            {columns: ['baz'], range: [0, 1]},
            {columns: ['foo'], range: [0, 1]}
        ])(data);
        const column = shallow(<Column x={x} y={y} color={color}/>);
        expect(column.name()).toBe('g');
    });

    it('only tries to render numerical values', () => {
        const [x,y] = useScales([
            {columns: ['baz'], range: [0, 1]},
            {columns: ['foo'], range: [0, 1]}
        ])(data);
        const column = shallow(<Column x={x} y={y} color={color}/>);

        expect(column).toContainMatchingElements(4, 'rect');
        expect(column).not.toContainMatchingElements(5, 'rect');
    });

    it('it can render negative sized rectangles', () => {
        const [x,y] = useScales([
            {columns: ['baz'], range: [0, 100]},
            {columns: ['foo'], range: [0, 100]}
        ])(data);
        const column = shallow(<Column x={x} y={y} color={color}/>);

        expect(column.find('rect').last()).not.toHaveProp('height', -100);
    });

});

describe('bar charts' , () => {

    it('it will render bars if the y scale is a bandwidth', () => {
        const [numerical, categorical] = useScales([
            {columns: ['foo'], range: [0, 200]},
            {columns: ['baz'], range: [0, 100]}
        ])(data);

        const bar = shallow(<Column x={numerical} y={categorical} color={color}/>);
        expect(bar.find('rect').last()).toHaveProp('width', 200);

        const column = shallow(<Column x={categorical} y={numerical} color={color}/>);
        expect(column.find('rect').last()).toHaveProp('height', 200);
    });

});

describe('stacking', () => {

    it('renders multi series as stacked', () => {
        const [numerical, categorical] = useScales([
            {columns: ['foo', 'bar'], range: [0, 200], stack: true},
            {columns: ['baz'], range: [0, 100]}
        ])(data);

        const bar = shallow(<Column x={categorical} y={numerical} color={color}/>);
        const last = bar.find('rect').at(7);
        const secondLast = bar.find('rect').at(6);

        expect(last).toHaveProp('y', secondLast.prop('height'));
    });

});

describe('histogram', () => {

    it('renders two point dimensions', () => {
        const binnedData = data.bin(
            'foo',
            null, null,
            (row) => {
                row.bar = row.bar.reduce((a, b) => a + b, 0);
                return row;
            }
        );
        const [numerical, categorical] = useScales([
            {columns: ['bar'], range: [0, 100]},
            {columns: ['fooLower', 'fooUpper'], range: [0, 100]}
        ])(binnedData);

        const bar = shallow(<Column x={categorical} y={numerical} color={color}/>);
        const last = bar.find('rect').last();

        expect(last).toHaveProp('height', 100);
        expect(last.find('rect').length).toBeLessThan(data.rows.length);
    });

});



