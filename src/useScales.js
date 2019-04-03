// @flow
import type ChartData from './chartdata/ChartData';
import type {Scale} from './definitions';
import type {ChartRow} from './definitions';

import applyDefaultScale from './util/defaultScale';

type Config = {
    column: string,
    updateScale: (scale: Scale) => Scale
};

export function useScales<R: ChartRow>(configList: Array<Config>) {
    return (data: ChartData<R>) => {
        let dimensions = [];
        let scaledData = [];


        for (let cc = 0; cc < configList.length; cc++) {
            const config = configList[cc];
            const {updateScale = aa => aa} = config;
            const {column} = config;
            const scale = updateScale(applyDefaultScale(config, data));

            scaledData[cc] = [];

            for(let rr = 0; rr < data.rows.length; rr++) {
                let row = data.rows[rr];

                scaledData[cc][rr] = scale(row[column]);

            }

            dimensions[cc] = {
                scale,
                scaledData
            }
        }

        return dimensions;
    }
}
