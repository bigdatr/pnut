// @flow
import type {Node} from 'react';
import type {ComponentType} from 'react';
import type {Dimension} from '../../useScales';

import React from 'react';
import {scaleBand} from 'd3-scale';

function isNumber(value): boolean %checks {
    return typeof value === 'number' && !isNaN(value);
}

type Props = {
    scales: {
        x: CategoricalScale,
        y: ContinuousScale,
        color: ColorScale
    },
    padding?: number
};

function safeRect(mm0, mm1) {
    let y = mm1;
    let height = mm0 - mm1;
    if(height < 0) {
        y = mm0;
        height = mm1 - mm0;
    }
    return [y, height];
}


export default class Column extends React.PureComponent<Props> {

    render(): Node {
        const {x, y, color, series} = this.props.scales;
        const {padding = 0.1} = this.props;

        return <g className="Column">{series.items.map((columnSet, index) => {
            x.scale = scaleBand(x.scale.domain(), x.scale.range()).padding(padding);

            return columnSet.map((item, columnIndex) => {
                const fill = color.scaleRow(item);
                const xValue = x.scale(x.get(item));

                console.log(y);
                let yValue, height;
                if(series.stack) {
                    let previousItem = columnSet[columnIndex - 1];
                    console.log(
                        previousItem ? y.scaleRow(previousItem) : y.range[0],
                        y.scaleRow(item)
                    );

                    [yValue, height] = safeRect(
                        previousItem ? y.scaleRow(previousItem) : y.range[0],
                        y.scaleRow(item)
                    );
                } else {
                    [yValue, height] = safeRect(y.range[0], y.scaleRow(item));
                }

                //console.log(y);
                //console.log(item, columnSet[columnIndex -1]);
                //const [yValue, height] = safeRect(
                    //y.stack ? y.scale(y.get(columnSet[columnIndex - 1] || item)) : y.range[0],
                    //y.scale(y.get(item))
                //);
                return <rect
                    key={index + '-' + columnIndex}
                    fill={fill}
                    x={xValue}
                    y={yValue}
                    width={x.scale.bandwidth()}
                    height={height}
                />;
            });
        })}</g>;
    }

    renderColumnSet({dimension, metric, column}: Object): Node {
        const {stack} = metric;
        const bandwidth = dimension.scale.bandwidth && dimension.scale.bandwidth();
        const {color} = this.props;
        const {column: Column = DefaultColumn} = this.props;

        return dimension.scaledData[0].map((dData, dIndex) => {
            return metric.scaledData.map((mData, mIndex) => {
                const pair = mData[dIndex];
                const mm0 = stack ? pair[0] : metric.range[0];
                const mm1 = stack ? pair[1] : pair[0];
                const dd = dData[0];
                if(!isNumber(mm0) || !isNumber(mm1) || !isNumber(dd)) return null;

                const span = dimension.scaledData.length > 1
                    ? dimension.scaledData[1][dIndex] - dimension.scaledData[0][dIndex]
                    : bandwidth;
                const {y, height} = safeRect(mm0, mm1);


                return <Column
                    color={color[metric.scaledData.length > 1 ? mIndex : dIndex]}
                    position={{
                        key: `$dIndex.$mIndex`,
                        x: column ? dd :  y,
                        y: column ? y :  dd,
                        height: column ? height :  span,
                        width: column ? span :  height
                    }}
                />;

            });
        });
    }
}


