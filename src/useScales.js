// @flow
import type ChartData from './chartdata/ChartData';
import type {ChartRow} from './definitions';
import type {Scale} from './definitions';

import createScale from './util/createScale';
import * as d3Shape from 'd3-shape';

export type Dimension = {
    scale: Scale,
    scaledData: Array<Array<Array<number|null>>>,
    stack?: boolean,
    zero?: boolean,
    range: [number, number]
};

export type DimensionConfig = {
    columns: Array<string>,
    stack?: boolean,
    offset?: 'expand' | 'diverging' | 'none' | 'silhouette' | 'wiggle',
    updateScale?: (scale: Scale) => Scale,
    range: [number, number]
};


const offsetTypes = {
    expand: d3Shape.stackOffsetExpand,
    diverging: d3Shape.stackOffsetDiverging,
    none: d3Shape.stackOffsetNone,
    silhouette: d3Shape.stackOffsetSilhouette,
    wiggle: d3Shape.stackOffsetWiggle
};



export default function useScales(configList: Array<DimensionConfig>) {
    return <R: ChartRow>(data: ChartData<R>): Array<Dimension> => {
        let dimensions = [];


        for (let cc = 0; cc < configList.length; cc++) {
            const config = configList[cc];
            let scaledData = [];
            let stackedData;
            const {updateScale = aa => aa} = config;
            const {columns} = config;
            const {offset = 'none'} = config;

            if(config.stack) {
                let layout = d3Shape.stack()
                    .keys(columns)
                    .offset(offsetTypes[offset]);

                stackedData = layout(data.rows);
            }

            const scale = updateScale(createScale({
                ...config,
                stackedData,
                data
            }));


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
                        scaledRow[rr] = [data == null ? null : scale(data)];
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
