import applyDimension from './applyDimension';

import type ChartRow from 'src/chartdata/ChartData';

function halfBandwidth(scale: Function): number {
    if(scale.bandwidth) {
        return scale.bandwidth() / 2;
    }
    return 0;
}

export default function scaleChartRow(dimension: Object, chartProps: Object): Function {
    const {columnName, dimensionName} = applyDimension(dimension, chartProps);

    return (row: ChartRow): * => {
        const scale = chartProps[dimension.scaleKey];
        const columnValue = row.get(columnName);



        switch (dimensionName) {
            case 'x':
                return scale(columnValue + halfBandwidth(scale));

            case 'y':
                return chartProps.height - scale(columnValue + halfBandwidth(scale));

            default:
                // the default behavior is to apply current column through current scale
                return scale(columnValue);
        }
    };
}
