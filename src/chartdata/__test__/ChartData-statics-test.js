import test from 'ava';
import ChartData from '../ChartData';

// dont show console errors
console.error = () => {};

//
// static
//

test('ChartData.isValueValid correctly identifies valid values', tt => {
    tt.true(ChartData.isValueValid(23), 'number is valid');
    tt.true(ChartData.isValueValid(-123.234), 'negative number is valid');
    tt.true(ChartData.isValueValid(0), 'zero number is valid');
    tt.true(ChartData.isValueValid("23"), 'string is valid');
    tt.true(ChartData.isValueValid(""), 'empty string is valid');
    tt.true(ChartData.isValueValid(null), 'null is valid');
    tt.true(ChartData.isValueValid(new Date('2017-01-01')), 'date is valid');
    tt.false(ChartData.isValueValid(new Date('invalid date')), 'invalid date is not valid');
    tt.false(ChartData.isValueValid(false), 'boolean (true) is not valid');
    tt.false(ChartData.isValueValid(true), 'boolean (false) is not valid');
    tt.false(ChartData.isValueValid(undefined), 'undefined is not valid');
    tt.false(ChartData.isValueValid({}), 'object is not valid');
    tt.false(ChartData.isValueValid(() => {}), 'function is not valid');
});

test('ChartData.isValueContinuous correctly identifies continuous values', tt => {
    tt.true(ChartData.isValueContinuous(23), 'number is continuous');
    tt.true(ChartData.isValueContinuous(-123.234), 'negative number is continuous');
    tt.true(ChartData.isValueContinuous(0), 'zero number is continuous');
    tt.true(ChartData.isValueContinuous(new Date('2017-01-01')), 'date is continuous');
    tt.false(ChartData.isValueContinuous(new Date('invalid date')), 'invalid date is not continuous');
    tt.false(ChartData.isValueContinuous("23"), 'string is not continuous');
    tt.false(ChartData.isValueContinuous(""), 'empty string is not continuous');
    tt.false(ChartData.isValueContinuous(null), 'null is not continuous');
    tt.false(ChartData.isValueContinuous(false), 'boolean (true) is not continuous');
    tt.false(ChartData.isValueContinuous(true), 'boolean (false) is not continuous');
    tt.false(ChartData.isValueContinuous(undefined), 'undefined is not continuous');
    tt.false(ChartData.isValueContinuous({}), 'object is not continuous');
    tt.false(ChartData.isValueContinuous(() => {}), 'function is not continuous');
});


test('ChartData.interpolate correctly interpolates values', tt => {
    // boundaries
    tt.is(ChartData.interpolate(10, 20, 0), 10, 'blend = 0 returns valueA');
    tt.is(ChartData.interpolate(10, 20, 1), 20, 'blend = 1 returns valueB');
    // invalid blends
    tt.is(ChartData.interpolate(10, 20, 2), null, 'blend > 1 returns null');
    tt.is(ChartData.interpolate(10, 20, -1), null, 'blend < 0 returns null');
    // nulls
    tt.is(ChartData.interpolate(null, 20, 0.5), null, 'valueA = null returns null');
    tt.is(ChartData.interpolate(10, null, 0.5), null, 'valueB = null returns null');
    // in the cases below, the data is treated as discrete and should return the nearest value
    tt.is(ChartData.interpolate("abc", 20, 0.2), "abc", 'valueA is not continous and blend < 0.5 returns valueA');
    tt.is(ChartData.interpolate("abc", 20, 0.5), 20, 'valueA is not continous and blend >= 0.5 returns valueB');
    tt.is(ChartData.interpolate(12, "def", 0.2), 12, 'valueB is not continous and blend < 0.5 returns valueA');
    tt.is(ChartData.interpolate(12, "def", 0.5), "def", 'valueB is not continous and blend >= 0.5 returns valueB');
    // interpolation
    tt.is(ChartData.interpolate(10, 20, 0.1), 11, 'interpolate works with numbers');
    tt.is(ChartData.interpolate(10, 20, 0.5), 15, 'interpolate works with numbers');
    tt.is(ChartData.interpolate(10, 20, 0.9), 19, 'interpolate works with numbers');
    tt.is(
        ChartData.interpolate(new Date('2017-01-01'), new Date('2017-01-03'), 0.5).getTime(),
        new Date('2017-01-02').getTime(),
        'interpolate works with dates'
    );
});

test('ChartData.interpolateDiscrete correctly interpolates values', tt => {
    // boundaries
    tt.is(ChartData.interpolateDiscrete(10, 20, 0), 10, 'blend = 0 returns valueA');
    tt.is(ChartData.interpolateDiscrete(10, 20, 1), 20, 'blend = 1 returns valueB');
    // invalid blends
    tt.is(ChartData.interpolateDiscrete(10, 20, 2), null, 'blend > 1 returns null');
    tt.is(ChartData.interpolateDiscrete(10, 20, -1), null, 'blend < 0 returns null');
    // in the cases below, the data is treated as discrete and should return the nearest value
    tt.is(ChartData.interpolateDiscrete("a", "b", 0.4), "a", 'interpolateDiscrete works with strings');
    tt.is(ChartData.interpolateDiscrete("a", "b", 0.5), "b", 'interpolateDiscrete works with strings');
    tt.is(ChartData.interpolateDiscrete(10, 20, 0.4), 10, 'interpolateDiscrete works with numbers');
    tt.is(ChartData.interpolateDiscrete(10, 20, 0.5), 20, 'interpolateDiscrete works with numbers');

    tt.is(
        ChartData.interpolateDiscrete(new Date('2017-01-01'), new Date('2017-01-03'), 0.2).getTime(),
        new Date('2017-01-01').getTime(),
        'interpolating works with dates'
    );
    tt.is(
        ChartData.interpolateDiscrete(new Date('2017-01-01'), new Date('2017-01-03'), 0.8).getTime(),
        new Date('2017-01-03').getTime(),
        'interpolating works with dates'
    );
});
