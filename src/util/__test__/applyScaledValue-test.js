import {scaleBand} from 'd3-scale';

import applyScaledValue from '../applyScaledValue';

const scale = scaleBand()
        .domain([1])
        .range([0, 1]);

test('applyScaledValue x will return scaled value + half bandwidth', () => {
    expect(applyScaledValue('x', scale, 1)).toEqual(.5);
});

test('applyScaledValue y will return height - scaled value + half bandwidth', () => {
    expect(applyScaledValue('y', scale, 1, {height: 100})).toEqual(99.5);
});

test('applyScaledValue defualt will return scaled value', () => {
    expect(applyScaledValue(null, scale, 1)).toEqual(0);
});

test('applyScaledValue will return null values without scale', () => {
    expect(applyScaledValue(null, scale, null)).toEqual(null);
});
