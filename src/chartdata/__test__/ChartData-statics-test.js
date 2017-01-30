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
    tt.false(ChartData.isValueContinuous("23"), 'string is not continuous');
    tt.false(ChartData.isValueContinuous(""), 'empty string is not continuous');
    tt.false(ChartData.isValueContinuous(null), 'null is not continuous');
    tt.false(ChartData.isValueContinuous(false), 'boolean (true) is not continuous');
    tt.false(ChartData.isValueContinuous(true), 'boolean (false) is not continuous');
    tt.false(ChartData.isValueContinuous(undefined), 'undefined is not continuous');
    tt.false(ChartData.isValueContinuous({}), 'object is not continuous');
    tt.false(ChartData.isValueContinuous(() => {}), 'function is not continuous');
});

test('ChartData.lerp correctly interpolates values', tt => {
    // boundaries
    tt.is(ChartData.lerp(10, 20, 0), 10, 'blend = 0 returns valueA');
    tt.is(ChartData.lerp(10, 20, 1), 20, 'blend = 1 returns valueB');
    // invalid blends
    tt.is(ChartData.lerp(10, 20, 2), null, 'blend > 1 returns null');
    tt.is(ChartData.lerp(10, 20, -1), null, 'blend < 0 returns null');
    // nulls
    tt.is(ChartData.lerp(null, 20, 0.5), null, 'valueA = null returns null');
    tt.is(ChartData.lerp(10, null, 0.5), null, 'valueB = null returns null');
    // in the cases below, the data is treated as discrete and should return the first value
    tt.is(ChartData.lerp("abc", 20, 0.5), "abc", 'valueA is not a number returns valueA');
    tt.is(ChartData.lerp(10, "def", 0.5), 10, 'valueB is not a number returns valueA');
    // interpolation
    tt.is(ChartData.lerp(10, 20, 0.1), 11, 'lerping works');
    tt.is(ChartData.lerp(10, 20, 0.5), 15, 'lerping works');
    tt.is(ChartData.lerp(10, 20, 0.9), 19, 'lerping works');
});
