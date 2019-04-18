import ChartData from '../../chartdata/ChartData';

import isDate from '../isDate';

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



describe('isDate', () => {
    test('returns an array of booleans for each column', () => {
        expect(isDate(['foo', 'bar', 'baz'], data)).toEqual([false, false, true]);
    });

    test('returns false for non-existing columnm', () => {
        expect(isDate(['baz', 'boo'], data)).toEqual([true, false]);
    });

    test('returns false if there is no rows in the chart data', () => {
        expect(isDate(['baz'], new ChartData([], columns))).toEqual([false]);
    });
});
