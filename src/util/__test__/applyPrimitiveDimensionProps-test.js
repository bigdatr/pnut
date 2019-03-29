import applyPrimitiveDimensionProps from '../applyPrimitiveDimensionProps';

test('applyPrimitiveDimensionProps will default return an empty object', () => {
    expect(applyPrimitiveDimensionProps()).toEqual({});
});

test('applyPrimitiveDimensionProps will return width height from x y dimensions', () => {
    expect(applyPrimitiveDimensionProps('x', {width: 1, height: 2})).toEqual({width: 1, height: 2});
    expect(applyPrimitiveDimensionProps('y', {width: 1, height: 2})).toEqual({width: 1, height: 2});
});
