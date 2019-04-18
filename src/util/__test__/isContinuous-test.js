import ChartData from '../../chartdata/ChartData';

import isContinuous from '../isContinuous';

const columns = [
    {key: 'foo'},
    {key: 'bar'},
    {key: 'baz'}
];

const rows = [
    {foo: 1, bar: 'a', baz: new Date('1970-01-01')},
    {foo: 2, bar: 'b', baz: new Date('1970-01-02')},
    {foo: 3, bar: 'c', baz: new Date('1970-01-03')}
];

const data = new ChartData(rows, columns);



describe('isContinuous', () => {
    test('returns an array of booleans for each column', () => {
        expect(isContinuous(['foo', 'bar', 'baz'], data)).toEqual([true, false, true]);
    });

    test('returns false for non-existing columnm', () => {
        expect(isContinuous(['baz', 'boo'], data)).toEqual([true, false]);
    });

    test('returns false if there is no rows in the chart data', () => {
        expect(isContinuous(['baz'], new ChartData([], columns))).toEqual([false]);
    });
});
