// @flow
import type ChartData from './chartdata/ChartData';
import type {ChartRow} from './definitions';
import type {ScaleConfig} from './util/createScale';

import createScale from './util/createScale';

export default function useScales<R: ChartRow>(configList: Array<ScaleConfig<R>>) {
    return (data: ChartData<R>) => {
        let dimensions = [];


        for (let cc = 0; cc < configList.length; cc++) {
            const config = configList[cc];
            let scaledData = [];
            const {updateScale = aa => aa} = config;
            const {columns} = config;
            const scale = updateScale(createScale({
                ...config,
                data
            }));


            for(let rr = 0; rr < data.rows.length; rr++) {
                let row = data.rows[rr];


                scaledData[rr] = columns.map(column => scale(row[column]));

            }

            dimensions[cc] = {
                scale,
                scaledData
            };
        }

        return dimensions;
    };
}
