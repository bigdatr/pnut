import test from 'ava';
import {Set} from 'immutable';
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

test('defaultScale will default to a linearScale with no range', tt => {
    const scale = defaultScale({
        columns: Set(['foo']),
        data
    });

    tt.is(scale.range()[0], 0);
    tt.is(scale.range()[1], 1);
});

test('scaleName will default to a linearScale with no range', tt => {
    const scale = defaultScale({
        columns: Set(['foo']),
        data
    });

    tt.is(scale.range()[0], 0);
    tt.is(scale.range()[1], 1);
});


test('mixing continuous and discrete data in scales will thrown an error', tt => {
    tt.throws(() => defaultScale({
        columns: Set(['foo', 'baz']),
        data
    }));
});

test('discrete domains will be the length of the data inserted', tt => {
    const scale = defaultScale({
        columns: Set(['baz']),
        data
    });

    tt.is(scale.domain().length, 3);
});

//
// time types
test('date columns will create a time scale', tt => {
    const scale = defaultScale({
        columns: Set(['qux']),
        data
    });

    tt.is(scale.range([0,2])(new Date('1970-01-03')), 2);
});

test('date columns will have a lower domain of their min value', tt => {
    const scale = defaultScale({
        columns: Set(['qux']),
        data
    });

    tt.is(scale.range([0,2])(new Date('1970-01-01')), 0);
});
