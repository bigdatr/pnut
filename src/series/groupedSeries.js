// @flow
import mapSeries from '../util/mapSeries';

function groupByArray(getter, data) {
    return Object.values(data.reduce((rr, item) => {
        const key = getter(item);
        rr[key] = (rr[key] || []).concat(item);
        return rr;
    }, {}));
}

type Config<A> = {
    groupBy: string,
    data: Array<A>
};

export default function GroupedSeries<A>(config: Config<A>): Series<A> {
    const {data, groupBy, process = s => s} = config;
    let items = groupByArray(groupBy, data);

    return process({
        _type: 'groupedSeries',
        groupBy,
        data,
        items
    });
}

export function stack(config) {
    const {column} = config;
    const {type} = config;
    return (rootSeries) => {
        rootSeries.stack = true;
        rootSeries.items = mapSeries(rootSeries, (rr, key, {index, seriesIndex, series}) => {
            let row = Object.assign({}, rr);

            if(type === 'outer') {
                if(seriesIndex > 0) {
                    row[column] = row[column] + rootSeries.items[seriesIndex - 1][index][column];
                }
            } else {
                if(index > 0) {
                    row[column] = row[column] + series[index - 1][column];
                }
            }
            return row;
        });
        return rootSeries;
    };
}
