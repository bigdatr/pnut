import applyDimension from './applyDimension';

import type ChartRow from 'src/chartdata/ChartData';

function halfBandwidth(scale: Function): number {
    if(scale.bandwidth) {
        return scale.bandwidth() / 2;
    }
    return 0;
}

function getScaledValue(dimensionName, scale, value, chartProps) {
    // const scale = newProps.get(dimension.scaleKey);

    switch (dimensionName) {
        case 'x':
            return scale(value) + halfBandwidth(scale);

        case 'y':
            return chartProps.get('height') - (scale(value) + halfBandwidth(scale));

        default:
            // the default behavior is to apply current column through current scale
            return scale(value);
    }
}

export default function scaleChartRow(dimensions: Array<Object>): Function {

    return (newProps: Map): * => {
        function withNewRows(row: ChartRow): Object {
            return dimensions
                .reduce((newRow: Object, dimension: Object): Object => {
                    const {columnName} = applyDimension(dimension, newProps.toObject());
                    const {dimensionName, scaleKey} = dimension;
                    const scale = newProps.get(scaleKey);
                    const value = row.get(columnName);
                    // console.log(dimension);

                    newRow[dimension.dimensionName] = getScaledValue(dimensionName, scale, value, newProps);
                    return newRow;
                }, {});
        }

        return newProps.set('scaledData', newProps.get('data').rows.map(withNewRows));
    };
}
