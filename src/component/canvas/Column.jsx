// @flow
import type {Node} from 'react';
import ContinuousScale from '../../scale/continuousScale';
import CategoricalScale from '../../scale/categoricalScale';
import ColorScale from '../../scale/colorScale';

import React from 'react';
import Series from '../../series/Series';

import {renderRect} from '../../util/defaultRenderFunctions';


type Props = {
    scales: {
        x: CategoricalScale,
        y: ContinuousScale,
        color: ColorScale,
        series: Series
    },
    strokeWidth?: string,
    stroke?: string,
    renderPoint?: Function
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
        const {renderPoint = renderRect} = this.props;
        const {x, y, color, series} = this.props.scales;
        if(!x.scale.bandwidth) throw new Error('x scale must have padding for column charts');


        return <g>{series.groups.map((group, groupIndex) => {
            return group.map((point, pointIndex) => {
                if(y.get(point) == null) return null;

                const fill = color.scalePoint(point);
                const xValue = x.scalePoint(point);
                let yValue, height, width, xOffset;


                if(series.preprocess.stacked) {
                    let previousItem = (series.preprocess.stackType === 'points')
                        ? series.get(groupIndex - 1, pointIndex)
                        : series.get(groupIndex, pointIndex - 1)
                    ;

                    let bottom = (previousItem && y.get(previousItem) && groupIndex !== 0) ? y.scalePoint(previousItem) : y.range[0];
                    let top = y.scalePoint(point);

                    const rr = safeRect(bottom, top);
                    width = x.scale.bandwidth();
                    xOffset = -(x.scale.bandwidth() / 2);
                    yValue = rr[0];
                    height = rr[1];
                } else {
                    const rr = safeRect(y.range[0], y.scalePoint(point));
                    yValue = rr[0];
                    height = rr[1];
                    width = x.scale.bandwidth() / series.groups.length;
                    xOffset = (width * groupIndex) - x.scale.bandwidth() / 2;
                }

                return renderPoint({
                    group,
                    groupIndex,
                    point,
                    pointIndex,
                    position: {
                        key: `${groupIndex}-${pointIndex}`,
                        fill,
                        x: xValue + xOffset,
                        y: yValue,
                        width,
                        height,
                        stroke: this.props.stroke,
                        strokeWidth: this.props.strokeWidth,
                        shapeRendering: 'crispedges'
                    }
                });

            });
        })}</g>;
    }

}


