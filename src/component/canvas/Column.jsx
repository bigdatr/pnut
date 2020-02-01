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

                let yValue, height;
                if(series.stack) {
                    const previousSeries = series.items[index - 1];
                    // @todo this complex series y movement should be put somewhere else
                    let previousItem = series.stackType === 'outer'
                        ? previousSeries && previousSeries[columnIndex]
                        : columnSet[columnIndex - 1];

                    [yValue, height] = safeRect(
                        previousItem ? y.scaleRow(previousItem) : y.range[0],
                        y.scaleRow(item)
                    );
                } else {
                    [yValue, height] = safeRect(y.range[0], y.scaleRow(item));
                }

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

}


