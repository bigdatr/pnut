// @flow
import type {Node} from 'react';
import type {Dimension} from '../../useScales';

import React from 'react';
import * as d3Shape from 'd3-shape';


type Props = {
    scales: {
        x: ContinuousScale,
        y: ContinuousScale,
        series: GroupedSeries|SingleSeries,
        color: ColorScale
    },
    x: Dimension,
    y: Dimension,
    color: Array<string>,
    area?: boolean,
    stack?: boolean,
    curve?: Function
};

export default class Line extends React.PureComponent<Props> {
    render(): Node {
        const {x, y, color, series} = this.props.scales;
        const {area} = this.props;
        const {stack} = series;
        const {curve = shape => shape.curveLinear} = this.props;
        const isDefined = (value) => typeof value === 'number' && !isNaN(value);


        let generator = area
            ? d3Shape.area()
                .x(x.scaleRow)
                .y0((_, index, {seriesIndex}) => {
                    if(!stack || seriesIndex === 0) return y.range[0];
                    return y.scaleRow(series.items[seriesIndex - 1][index]);
                })
                .y1(y.scaleRow)
                .defined(row => isDefined(y.get(row)))
                .curve(curve(d3Shape))
            : d3Shape.line()
                .x(x.scaleRow)
                .y(y.scaleRow)
                .defined(row => isDefined(y.get(row)))
                .curve(curve(d3Shape))
        ;


        return <g className="Line">
            {series.items.map((series, key) => {
                // we need to bind the current seriesIndex
                // to our array for use in y0
                series.seriesIndex = key;
                return this.renderPath({
                    key,
                    d: generator(series),
                    area,
                    color: color.scaleRow(series[0])
                });
            })}
        </g>;
    }

    renderPath({d, key, area, color}) {
        return <path
            key={key}
            d={d}
            fill={area ? color : 'none'}
            stroke={area ? 'none' : color}
        />;
    }

}

