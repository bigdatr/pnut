import useScales from '../useScales';
import ChartData from '../chartdata/ChartData';
const columns = [
    {key: 'foo'},
    {key: 'bar'},
    {key: 'baz'},
    {key: 'qux'}
];

const rows = [
    {foo: 1, bar: 4, baz: 'a', qux: new Date('1970-01-01')},
    {foo: 2, bar: 5, baz: 'b', qux: new Date('1970-01-02')},
    {foo: 3, bar: 6, baz: 'c', qux: new Date('1970-01-03')},
    {foo: 4, bar: 7, baz: 'c', qux: new Date('1970-01-03')}
];

const data = new ChartData(rows, columns);

test('useScales will scale data', () => {
    const [x, y] = useScales([
        {columns: ['foo'], upperBound: 100},
        {columns: ['bar'], upperBound: 100}
    ])(data);

    expect(x.scaledData).toEqual([[25], [50], [75], [100]]);
    expect(y.scaledData).toBe(0);
});
