// @flow
import type {Node} from 'react';

import React from 'react';
import {scaleBand} from 'd3-scale';


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
        if(!x.scale.bandwidth) throw new Error('x scale must have padding for column charts');

        return <g className="Column">{series.rows.map((row, rowIndex) => {
            return row.map((column, columnIndex) => {
                const fill = color.scaleRow(column);
                const xValue = x.scale(x.get(column));
                let yValue, height, width, xOffset;

                if(series.preprocess.stacked) {
                    let previousItem = (series.preprocess.stackType === 'columns')
                        ? series.get(rowIndex - 1, columnIndex)
                        : series.get(rowIndex, columnIndex - 1)
                    ;

                    let bottom = (previousItem && y.get(previousItem) && rowIndex !== 0) ? y.scaleRow(previousItem) : y.range[0];
                    let top = y.scaleRow(column);

                    const rr = safeRect(bottom, top);
                    width = x.scale.bandwidth();
                    xOffset = 0;
                    yValue = rr[0];
                    height = rr[1];
                } else {
                    const rr = safeRect(y.range[0], y.scaleRow(column));
                    yValue = rr[0];
                    height = rr[0];
                    width = x.scale.bandwidth() / series.rows.length;
                    xOffset = width * rowIndex;
                }

                return <rect
                    key={rowIndex + '-' + columnIndex}
                    fill={fill}
                    x={xValue + xOffset}
                    y={yValue}
                    width={width}
                    height={height}
                    stroke={this.props.stroke}
                    strokeWidth={this.props.strokeWidth}
                    shapeRendering="crispedges"
                />;
            });
        })}</g>;
    }

}


