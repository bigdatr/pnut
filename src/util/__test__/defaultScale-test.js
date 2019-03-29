import ChartData from '../../chartdata/ChartData';

import defaultScale from '../defaultScale';

const columns = [
    {key: 'foo'},
    {key: 'bar'},
    {key: 'baz'},
    {key: 'qux'}
];

const rows = [
    {foo: 1, bar: 4, baz: 'a', qux: new Date('1970-01-01')},
    {foo: 2, bar: 5, baz: 'b', qux: new Date('1970-01-02')},
    {foo: 3, bar: 6, baz: 'c', qux: new Date('1970-01-03')}
];

const data = new ChartData(rows, columns);


//
// scale

test('defaultScale will default to a linearScale with no range', () => {
    const scale = defaultScale({
        columns: ['foo'],
        data
    });

    expect(scale.range()[0]).toBe(0);
    expect(scale.range()[1]).toBe(1);
});

test('scaleName will default to a linearScale with no range', () => {
    const scale = defaultScale({
        columns: ['foo'],
        data
    });

    expect(scale.range()[0]).toBe(0);
    expect(scale.range()[1]).toBe(1);
});


test('mixing continuous and discrete data in scales will thrown an error', () => {
    expect(() => defaultScale({
        columns: ['foo', 'baz'],
        data
    })).toThrow();
});

test('discrete domains will be the length of the data inserted', () => {
    const scale = defaultScale({
        columns: ['baz'],
        data
    });

    expect(scale.domain().length).toBe(3);
});

//
// time types
test('date columns will create a time scale', () => {
    const scale = defaultScale({
        columns: ['qux'],
        data
    });

    expect(scale.range([0,2])(new Date('1970-01-03'))).toBe(2);
});

test('date columns will have a lower domain of their min value', () => {
    const scale = defaultScale({
        columns: ['qux'],
        data
    });

    expect(scale.range([0,2])(new Date('1970-01-01'))).toBe(0);
});
