import test from 'ava';

import applyPrimitiveDimensionProps from '../applyPrimitiveDimensionProps';

test('applyPrimitiveDimensionProps will default return an empty object', tt => {
    tt.deepEqual(applyPrimitiveDimensionProps(), {});
});

test('applyPrimitiveDimensionProps will return width height from x y dimensions', tt => {
    tt.deepEqual(applyPrimitiveDimensionProps('x', {width: 1, height: 2}), {width: 1, height: 2});
    tt.deepEqual(applyPrimitiveDimensionProps('y', {width: 1, height: 2}), {width: 1, height: 2});
});


