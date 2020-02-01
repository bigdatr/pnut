// @flow
export default function mapSeries(rootSeries, fn) {
    return rootSeries.items.map((series, seriesIndex) => series.map((item, index) => fn(
        item,
        `${seriesIndex}-${index}`,
        {index, seriesIndex, series}
    )));
}
