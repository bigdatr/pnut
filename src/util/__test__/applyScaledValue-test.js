import test from 'ava';
import {scaleBand} from 'd3-scale';

import applyScaledValue from '../applyScaledValue';

const scale = scaleBand()
        .domain([1])
        .range([0, 1]);

test('applyScaledValue x will return scaled value + half bandwidth', tt => {
    tt.deepEqual(applyScaledValue('x', scale, 1), .5);
});

test('applyScaledValue y will return height - scaled value + half bandwidth', tt => {
    tt.deepEqual(applyScaledValue('y', scale, 1, {height: 100}), 99.5);
});

test('applyScaledValue defualt will return scaled value', tt => {
    tt.deepEqual(applyScaledValue(null, scale, 1), 0);
});

test('applyScaledValue will return null values without scale', tt => {
    tt.deepEqual(applyScaledValue(null, scale, null), null);
});
