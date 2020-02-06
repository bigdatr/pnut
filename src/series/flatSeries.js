// @flow

type Config<A> = {
    groupBy: string,
    data: Array<A>
};

export default function FlatSeries<A>(config: Config<A>): Series<A> {
    const {data, process = s => s} = config;

    return process({
        type: 'flatSeries',
        data,
        items: process(data.map(row => [row]))
    });
}

