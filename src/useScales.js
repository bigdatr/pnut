// @flow
import type ChartData from './chartdata/ChartData';
import type {ChartRow} from './definitions';
import type {ScaleConfig} from './util/createScale';

import createScale from './util/createScale';
import * as d3Shape from 'd3-shape';

export type Dimension = {
    scale: Function,
    scaledData: Array<Array<number>>,
    stack?: boolean,
    range: [number, number]
};

const notNull = (scale) => (value) => value == null ? null : scale(value);

export default function useScales<R: ChartRow>(configList: Array<*>) {
    return (data: ChartData<R>): Array<Dimension> => {
        let dimensions = [];
        dimensions.type = 'dimensions';


        for (let cc = 0; cc < configList.length; cc++) {
            const config = configList[cc];
            let scaledData = [];
            let stackedData;
            const {updateScale = aa => aa} = config;
            const {columns} = config;
            const scale = updateScale(createScale({
                ...config,
                data
            }));

            if(config.stack) {
                stackedData = d3Shape.stack().keys(columns)(data.rows);
            }

            scaledData = columns.map((key, index) => {
                let scaledRow = [];

                for(let rr = 0; rr < data.rows.length; rr++) {
                    let row = data.rows[rr];


                    if(config.stack) {
                        const stackedRow = stackedData[index];
                        const stackedColumn = stackedRow[rr];
                        scaledRow[rr] = stackedColumn.map(value => {
                            return stackedColumn.data[stackedRow.key] == null ? null : scale(value);
                        });
                    } else {
                        let data = row[key];
                        scaledRow[rr] = [notNull(scale)(data)]
                    }

                }

                return scaledRow;
            });

            dimensions[cc] = {
                ...config,
                scale,
                scaledData
            };
        }

        return dimensions;
    };
}
