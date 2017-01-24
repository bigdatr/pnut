import test from 'ava';
import ChartData from '../ChartData';

// dont show console errors
console.error = () => {};

//
// static
//

test('ChartData correctly identifies valid values', tt => {
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

test('ChartData correctly identifies continuous values', tt => {
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
