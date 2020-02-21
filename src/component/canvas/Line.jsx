// @flow
import type {Node} from 'react';
import type Series from '../../series/Series';
import type {ContinuousScale} from '../../scale/continuousScale';
import type {ColorScale} from '../../scale/colorScale';

import React from 'react';
import * as d3Shape from 'd3-shape';


type Props = {
    scales: {
        x: ContinuousScale,
        y: ContinuousScale,
        color: ColorScale,
        series: Series
    },
    area?: boolean,
    stack?: boolean,
    curve?: Function,
    strokeWidth?: number
};

export default class Line extends React.PureComponent<Props> {
    render(): Node {
        const {x, y, color, series} = this.props.scales;
        const {area} = this.props;
        const {curve = shape => shape.curveLinear} = this.props;
        const isDefined = (value) => typeof value === 'number' && !isNaN(value);


        let generator = area
            ? d3Shape.area()
                .x(x.scalePoint)
                .y0((_, pointIndex, {groupIndex}) => {
                    if(!series.preprocess.stacked || groupIndex === 0) return y.range[0];
                    return y.scalePoint(series.get(groupIndex - 1, pointIndex));
                })
                .y1(y.scalePoint)
                .defined(group => isDefined(y.get(group)))
                .curve(curve(d3Shape))
            : d3Shape.line()
                .x(x.scalePoint)
                .y(y.scalePoint)
                .defined(group => isDefined(y.get(group)))
                .curve(curve(d3Shape))
        ;


        return <g className="Line">
            {series.groups.map((group, key) => {
                // we need to bind the current seriesIndex
                // to our array for use in y0
                // $FlowFixMe - intentional javascript hacks
                group.groupIndex = key;
                return this.renderPath({
                    key,
                    d: generator(group),
                    area,
                    color: color.scalePoint(group.find(color.get))
                });
            })}
        </g>;
    }

    renderPath({d, key, area, color}: {d: string, key: number, area?: boolean, color: string}) {
        const {strokeWidth = 2} = this.props;
        return <path
            key={key}
            d={d}
            fill={area ? color : 'none'}
            stroke={area ? 'none' : color}
            strokeWidth={strokeWidth}
        />;
    }

}

