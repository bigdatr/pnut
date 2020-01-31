// @flow

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
    let items = process(groupByArray(groupBy, data));
    console.log(items);

    return {
        _type: 'groupedSeries',
        groupBy,
        data,
        items
    };
}

export function stack(config) {
    const {column} = config;
    return (series) => series.map(data => data.map((ii, index, list) => {
        if(index > 0) {
            ii[column] = ii[column] + list[index -1][column];
        }
        return ii;
    }));
}
