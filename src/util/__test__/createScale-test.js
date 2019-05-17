import createScale from '../createScale';
import ChartData from '../../chartdata/ChartData';
import {stack} from 'd3-shape';

const columns = [
    {key: 'foo'},
    {key: 'bar'},
    {key: 'baz'},
];

const rows = [
    {foo: 1, bar: 'a', baz: new Date('1970-01-01')},
    {foo: 2, bar: 'b', baz: new Date('1970-01-02')},
    {foo: 3, bar: 'c', baz: new Date('1970-01-03')}
];

const data = new ChartData(rows, columns);

describe('linear', () => {
    const scale = createScale({
        columns: ['foo'],
        data,
        range: [0, 1]
    });

    it('will create a linear scale for numbers', () => {
        expect(typeof scale.invert).toEqual('function');
    });

    it('will set the domain bounds to min and max of the columns', () => {
        expect(scale.domain()).toEqual([1, 3]);
    });

    it('will set the domain bounds to 0 and max of the columns if config.zero is set', () => {
        const scale = createScale({
            columns: ['foo'],
            data,
            zero: true,
            range: [0, 1]
        });
        expect(scale.domain()).toEqual([0, 3]);
    });

});

describe('stacked linear', () => {

    it('will set the domain bounds to minimum and the maxiumum of the sum of each rows column', () => {
        const rows = [
            {foo: -1, bar: -2, baz: new Date('1970-01-01')},
            {foo: 2, bar: 2, baz: new Date('1970-01-02')},
            {foo: 3, bar: 3, baz: new Date('1970-01-03')}
        ];

        const data = new ChartData(rows, columns);
        const stackedData = stack().keys(['foo', 'bar'])(rows);
        const scale = createScale({
            columns: ['foo', 'bar'],
            data,
            range: [0, 1],
            stack: true,
            stackedData
        });

        expect(scale.domain()).toEqual([-1, 6]);
    });

    it('can find the highest number even if they are out of order', () => {
        const rows = [
            {foo: 2, bar: 'b', baz: new Date('1970-01-02')},
            {foo: 1, bar: 'a', baz: new Date('1970-01-01')},
            {foo: 4, bar: 'c', baz: new Date('1970-01-03')}
        ];

        const data = new ChartData(rows, columns);
        const stackedData = stack().keys(['foo', 'foo'])(rows);
        const scale = createScale({
            columns: ['foo', 'foo'],
            data,
            range: [0, 1],
            stack: true,
            stackedData
        });
        expect(scale.domain()).toEqual([0, 8]);
    });

    it('wont choke on null values', () => {
        const rows = [
            {foo: 2, bar: 2, baz: new Date('1970-01-02')},
            {foo: null, bar: null, baz: new Date('1970-01-01')},
            {foo: 4, bar: 4, baz: new Date('1970-01-03')}
        ];

        const data = new ChartData(rows, columns);
        const stackedData = stack().keys(['foo', 'bar'])(rows);
        const scale = createScale({
            columns: ['foo', 'bar'],
            data,
            range: [0, 1],
            stack: true,
            stackedData
        });
        expect(scale.domain()).toEqual([0, 8]);
    });

    it('will throw if you try and stack dates', () => {
        const stackedData = stack().keys(['baz', 'baz'])(rows);
        const scale = () => createScale({
            columns: ['baz', 'baz'],
            data,
            range: [0, 1],
            stack: true,
            stackedData
        });
        expect(scale).toThrow('Stacked columns must be numerical');
    });

});

describe('time', () => {
    const scale = createScale({
        columns: ['baz'],
        data,
        range: [0, 1]
    });

    it('will create a time scale for dates', () => {
        expect(typeof scale.invert).toEqual('function');
    });

    it('will set the domain bounds to the min and max of the columns', () => {
        expect(scale.domain()).toEqual([new Date('1970-01-01'), new Date('1970-01-03')]);
    });

});


describe('categorical', () => {
    const scale = createScale({
        columns: ['bar'],
        data,
        range: [0, 1]
    });

    it('will create a band scale for strings', () => {
        expect(typeof scale.bandwidth).toEqual('function');
    });

    it('will set the domain to the uninvertique values of the columns', () => {
        expect(scale.domain()).toEqual(['a', 'b', 'c']);
    });

});


describe('all scales', () => {

    it('will use the range provided', () => {
        const range = [9000, 9001];
        const scale = createScale({columns: ['bar'], data, range});
        expect(scale.range()).toEqual(range);
    });

    it('cannot mix types', () => {
        const scale = () => createScale({
            columns: ['foo', 'bar'],
            data,
            range: [0, 1]
        });

        expect(scale).toThrow('A scale cannot share continuous and non continuous data: foo, bar');
    });

    it('can override the scale', () => {
        const scale = createScale({
            columns: ['foo'],
            data,
            scaleType: 'scaleBand',
            range: [0, 1]
        });
        expect(typeof scale.bandwidth).toBe('function');
    });

});
