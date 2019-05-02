// @flow
import type {Node} from 'react';
import type {ComponentType} from 'react';
import type {Dimension} from '../../useScales';

import React from 'react';

function isNumber(value): boolean %checks {
    return typeof value === 'number' && !isNaN(value);
}

type Props = {
    x: Dimension,
    y: Dimension,
    color: Array<string>,
    column?: (line: ComponentType<*>, props: Object) => Node,
    stack?: boolean,
    horizontal?: boolean
};

function safeRect(mm0, mm1) {
    let y = mm1;
    let height = mm0 - mm1;
    if(height < 0) {
        y = mm0;
        height = mm1 - mm0;
    }
    return {y, height};
}

export default class ColumnRenderable extends React.PureComponent<Props> {

    render(): Node {
        const {x} = this.props;
        const {y} = this.props;
        const {color} = this.props;
        const {group} = this.props;

        let dimension = x;
        let metric = y;
        let column = true;

        if(y.scale.bandwidth) {
            column = false;
            dimension = y;
            metric = x;
        }



        if(group) {
            return <g>{group.scale.domain().map((groupKey, index) => {
                const currentPositon = group.scale(groupKey);

                // map groups
                // => collect safe indexes
                // => map dimension
                // => map metrics
                // => render columns
                const filteredIndexes = group.scaledData[0].flatMap((ii, index) => {
                    return ii[0] === currentPositon ? [index] : [];
                });

                const scaledData = metric.scaledData.map((set) => filteredIndexes.map(ii => set[ii]));

                console.log(filteredIndexes, scaledData);
                return <g
                    transform={`translate(${group.scale.bandwidth() * index},0)`}
                    children={this.renderColumnSet({
                        dimension: {
                            ...group,
                            scaledData,
                            scale: group.scale.range([0, group.scale.bandwidth()])
                        },
                        metric,
                        column
                    })}
                />
            })}</g>;
        }

        return <g>{this.renderColumnSet({
            dimension,
            metric,
            column
        })}</g>;
    }

    renderColumnSet({dimension, metric, column}: Object): Node {
        const {stack} = metric;
        const bandwidth = dimension.scale.bandwidth();
        const {color} = this.props;
        return dimension.scaledData[0].map((dData, dIndex) => {
            return metric.scaledData.map((mData, mIndex) => {
                const pair = mData[dIndex];
                const mm0 = stack ? pair[0] : metric.range[0];
                const mm1 = stack ? pair[1] : pair[0];
                const dd = dData[0];
                if(!isNumber(mm0) || !isNumber(mm1) || !isNumber(dd)) return null;

                const span = bandwidth;
                const {y, height} = safeRect(mm0, mm1);

                return <rect
                    fill={color[mIndex]}
                    key={`${dIndex}.${mIndex}`}
                    x={column ? dd : y}
                    y={column ? y : dd}
                    height={column ? height : span}
                    width={column ? span : height}
                />;

            });
        })
    }
}


