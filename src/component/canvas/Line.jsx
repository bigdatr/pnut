// @flow
import type {Node} from 'react';
import Series from '../../series/Series';
import ContinuousScale from '../../scale/continuousScale';
import ColorScale from '../../scale/colorScale';
import {renderPath} from '../../util/defaultRenderFunctions';

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
    curve?: Function,
    strokeWidth?: string,
    renderGroup?: Function
};

export default class Line extends React.PureComponent<Props> {
    render(): Node {
        const {x, y, color, series} = this.props.scales;
        const {area} = this.props;
        const {renderGroup = renderPath} = this.props;
        const {strokeWidth = '2px'} = this.props;
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
            {series.groups.map((group, groupIndex) => {
                // we need to bind the current seriesIndex
                // to our array for use in y0
                // $FlowFixMe - intentional javascript hacks
                group.groupIndex = groupIndex;

                const fill = color.scalePoint(group.find(color.get));

                return renderGroup({
                    group,
                    groupIndex,
                    position: {
                        key: groupIndex,
                        d: generator(group),
                        fill: area ? fill : 'none',
                        stroke: area ? 'none' : fill,
                        strokeWidth
                    }
                });

            })}
        </g>;
    }

}

