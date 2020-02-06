// @flow
import sortBy from 'unmutable/sortBy';
import chunkBy from 'unmutable/chunkBy';
import pipeWith from 'unmutable/pipeWith';
import get from 'unmutable/get';

export default function binLongTail(config) {
    const {column} = config;
    const {threshold} = config;
    const {accumulate} = config;
    return (rootSeries) => {

        rootSeries.binLongTail = true;

        rootSeries.items = rootSeries.items.map(seriesItem => {
            const total = seriesItem.reduce((rr, row) => rr + row[column], 0);

            let split = false
            const [big, small] = pipeWith(
                seriesItem,
                sortBy(ii => get(column)(ii) * -1),
                chunkBy(ii => {
                    const check = (ii[column] / total) < threshold;
                    if(check && !split) {
                        split = true;
                        return check;
                    }
                    return false;
                })
            );

            const response = big.concat(small.length > 0 ? accumulate(small) : []);
            console.log(response);
            return response;

        });

        return rootSeries;

    }
}
