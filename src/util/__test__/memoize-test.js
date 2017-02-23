import test from 'ava';
import {Set} from 'immutable';
import {spy} from 'sinon';
import ChartData from '../../chartdata/ChartData';

import memoize from '../memoize';


test('memoized function will not call if they are already stored', tt => {
    var memo = memoize({});
    const test = spy();
    memo('rad', test);
    memo('rad', test);
    memo('rad', test);
    memo('rad', test);
    tt.is(test.callCount, 1);
});
