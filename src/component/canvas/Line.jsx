// @flow
import type {Node} from 'react';
import type {ComponentType} from 'react';
import type {Dimension} from '../../useScales';
import type {PathPosition} from '../../definitions';

import React from 'react';
import * as d3Shape from 'd3-shape';


type Props = {
    x: Dimension,
    y: Dimension,
    color: Array<string>,
    line?: ComponentType<*>,
    area?: boolean,
    stack?: boolean,
    curve?: Function
};

export class Line extends React.PureComponent<Props> {
    render(): Node {
        const {x} = this.props;
        const {y} = this.props;
        const {color = ['#ccc']} = this.props;
        const {line: Line = DefaultLine} = this.props;
        const {curve = (_) => _.curveLinear} = this.props;
        const {area = false} = this.props;

        const getX = (_, index) => x.scaledData[0][index];
        const getY1 = (data) => y.stack ? data[1] : data[0];
        const isDefined = (value) => typeof value === 'number' && !isNaN(value);


        const generator = (area)
            ? d3Shape.area()
                .x(getX)
                .y0((data) => y.stack ? data[0] : y.range[0])
                .y1(getY1)
                .defined((data) => isDefined(data[0]))
                .curve(curve(d3Shape))
            : d3Shape.line()
                .x(getX)
                .y(getY1)
                .defined((data) => isDefined(y.stack ? data[1] : data[0]))
                .curve(curve(d3Shape))
        ;


        return <g>
            {y.scaledData.map((set, index) => <Line
                key={index}
                position={{d: generator(set)}}
                area={area}
                color={color[index]}
            />)}
        </g>;
    }
}

function DefaultLine(props: {position: PathPosition, area: boolean, color: string}): Node {
    const {position, area, color} = props;
    return <path
        {...position}
        fill={area ? color : 'none'}
        stroke={area ? 'none' : color}
    />;
}



export default Line;
