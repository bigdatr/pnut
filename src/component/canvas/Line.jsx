// @flow
import type {Node} from 'react';
import type {ComponentType} from 'react';
import type {Dimension} from '../../useScales';
import type {PathPosition} from '../../definitions';

import React from 'react';
import * as d3Shape from 'd3-shape';


type Props = {
    scales: {
        x: ContinuousScale,
        y: ContinuousScale,
        series: GroupedSeries|SingleSeries
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
        const {x, y, series} = this.props.scales;
        const {area} = this.props;
        const {stack} = series;
        const {curve = shape => shape.curveLinear} = series;
        const {column} = series;

        console.log(x);
        const getX = (row) => x.scale(row[column]);
        const getY0 = (row) => y.scale(stack ? row[column][0] : y.range[0]);
        const getY1 = (row) => y.scale(stack ? row[column][1] : row[column]);
        const isDefined = (value) => typeof value === 'number' && !isNaN(value);

        console.log(this.props);

        let generator = area
            ? d3Shape.area().y0(getY0).y1(getY1)
            : d3Shape.line()
                .x(row => console.log(row[x.column]) || x.scale(row[x.column]))
                .y(row => y.scale(row[y.column]))
                .defined(row => isDefined(row[y.column]))
                .curve(curve(d3Shape))
        ;


        return <g className="Line">
            {[].concat(series.items)
                .map((series, key) => this.renderPath({series, key, generator, area, color: '#ccc'}))}
        </g>;
    }

    renderPath({series, key, generator, area, color}) {
        console.log({d: generator(series)});
        return <path
            key={key}
            d={generator(series)}
            fill={area ? color : 'none'}
            stroke={area ? 'none' : color}
        />;
    }

}

