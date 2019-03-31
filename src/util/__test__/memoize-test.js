import ChartData from '../../chartdata/ChartData';

import memoize from '../memoize';


test('memoized function will not call if they are already stored', () => {
    var memo = memoize({});
    const test = jest.fn();
    memo('rad', test);
    memo('rad', test);
    memo('rad', test);
    memo('rad', test);
    expect(test).toHaveBeenCalledTimes(1);
});
