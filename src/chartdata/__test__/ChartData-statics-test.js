import ChartData from '../ChartData';

// dont show console errors
console.error = () => {};

//
// static
//

test('ChartData.isValueValid correctly identifies valid values', () => {
    expect(ChartData.isValueValid(23)).toBe(true);
    expect(ChartData.isValueValid(-123.234)).toBe(true);
    expect(ChartData.isValueValid(0)).toBe(true);
    expect(ChartData.isValueValid("23")).toBe(true);
    expect(ChartData.isValueValid("")).toBe(true);
    expect(ChartData.isValueValid(null)).toBe(true);
    expect(ChartData.isValueValid(new Date('2017-01-01'))).toBe(true);
    expect(ChartData.isValueValid(new Date('invalid date'))).toBe(false);
    expect(ChartData.isValueValid(false)).toBe(false);
    expect(ChartData.isValueValid(true)).toBe(false);
    expect(ChartData.isValueValid(undefined)).toBe(false);
    expect(ChartData.isValueValid({})).toBe(false);
    expect(ChartData.isValueValid(() => {})).toBe(false);
});

test('ChartData.isValueContinuous correctly identifies continuous values', () => {
    expect(ChartData.isValueContinuous(23)).toBe(true);
    expect(ChartData.isValueContinuous(-123.234)).toBe(true);
    expect(ChartData.isValueContinuous(0)).toBe(true);
    expect(ChartData.isValueContinuous(new Date('2017-01-01'))).toBe(true);
    expect(ChartData.isValueContinuous(new Date('invalid date'))).toBe(false);
    expect(ChartData.isValueContinuous("23")).toBe(false);
    expect(ChartData.isValueContinuous("")).toBe(false);
    expect(ChartData.isValueContinuous(null)).toBe(false);
    expect(ChartData.isValueContinuous(false)).toBe(false);
    expect(ChartData.isValueContinuous(true)).toBe(false);
    expect(ChartData.isValueContinuous(undefined)).toBe(false);
    expect(ChartData.isValueContinuous({})).toBe(false);
    expect(ChartData.isValueContinuous(() => {})).toBe(false);
});


test('ChartData.interpolate correctly interpolates values', () => {
    // boundaries
    expect(ChartData.interpolate(10, 20, 0)).toBe(10);
    expect(ChartData.interpolate(10, 20, 1)).toBe(20);
    // invalid blends
    expect(ChartData.interpolate(10, 20, 2)).toBe(null);
    expect(ChartData.interpolate(10, 20, -1)).toBe(null);
    // nulls
    expect(ChartData.interpolate(null, 20, 0.5)).toBe(null);
    expect(ChartData.interpolate(10, null, 0.5)).toBe(null);
    // in the cases below, the data is treated as discrete and should return the nearest value
    expect(ChartData.interpolate("abc", 20, 0.2)).toBe("abc");
    expect(ChartData.interpolate("abc", 20, 0.5)).toBe(20);
    expect(ChartData.interpolate(12, "def", 0.2)).toBe(12);
    expect(ChartData.interpolate(12, "def", 0.5)).toBe("def");
    // interpolation
    expect(ChartData.interpolate(10, 20, 0.1)).toBe(11);
    expect(ChartData.interpolate(10, 20, 0.5)).toBe(15);
    expect(ChartData.interpolate(10, 20, 0.9)).toBe(19);
    expect(
        ChartData.interpolate(new Date('2017-01-01'), new Date('2017-01-03'), 0.5).getTime()
    ).toBe(new Date('2017-01-02').getTime());
});

test('ChartData.interpolateDiscrete correctly interpolates values', () => {
    // boundaries
    expect(ChartData.interpolateDiscrete(10, 20, 0)).toBe(10);
    expect(ChartData.interpolateDiscrete(10, 20, 1)).toBe(20);
    // invalid blends
    expect(ChartData.interpolateDiscrete(10, 20, 2)).toBe(null);
    expect(ChartData.interpolateDiscrete(10, 20, -1)).toBe(null);
    // in the cases below, the data is treated as discrete and should return the nearest value
    expect(ChartData.interpolateDiscrete("a", "b", 0.4)).toBe("a");
    expect(ChartData.interpolateDiscrete("a", "b", 0.5)).toBe("b");
    expect(ChartData.interpolateDiscrete(10, 20, 0.4)).toBe(10);
    expect(ChartData.interpolateDiscrete(10, 20, 0.5)).toBe(20);

    expect(
        ChartData.interpolateDiscrete(new Date('2017-01-01'), new Date('2017-01-03'), 0.2).getTime()
    ).toBe(new Date('2017-01-01').getTime());
    expect(
        ChartData.interpolateDiscrete(new Date('2017-01-01'), new Date('2017-01-03'), 0.8).getTime()
    ).toBe(new Date('2017-01-03').getTime());
});


test('ChartData.isValueTime returns true for valid date', () => {
    expect(ChartData.isValueDate(new Date('2017-01-01'))).toBe(true);
    expect(ChartData.isValueDate(new Date('invalid date'))).toBe(false);
    expect(ChartData.isValueDate(1)).toBe(false);
    expect(ChartData.isValueDate('1')).toBe(false);
    expect(ChartData.isValueDate({})).toBe(false);
});
