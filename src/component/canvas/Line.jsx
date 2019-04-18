// @flow
import type {Node} from 'react';
import type {ComponentType} from 'react';
import type {Dimension} from '../../useScales';

import React from 'react';
import * as d3Shape from 'd3-shape';


type Props = {
    x: Dimension,
    y: Dimension,
    color: Array<string>,
    line?: (line: ComponentType<*>, props: Object) => Node,
    area?: boolean,
    stack?: boolean,
    curveFunction?: Function
};

export class Line extends React.PureComponent<Props> {

    render(): Node {
        const {x} = this.props;
        const {y} = this.props;
        const {color = ['#ccc']} = this.props;
        const {line = (Line, props) => <Line {...props}/>} = this.props;
        const {curveFunction = d3Shape.curveLinear} = this.props;
        const {area = false} = this.props;

        const getX = (_, index) => x.scaledData[0][index];
        const getY1 = (data) => y.stack ? data[1] : data[0];
        const isDefined = (value) => typeof value === 'number' && !isNaN(value);
        const lineComponent = (props) => <path {...props} />;


        const generator = (area)
            ? d3Shape.area()
                .x(getX)
                .y0((data) => y.stack ? data[0] : y.range[0])
                .y1(getY1)
                .defined((data) => isDefined(data[0]))
                .curve(curveFunction)
            : d3Shape.line()
                .x(getX)
                .y(getY1)
                .defined((data) => isDefined(y.stack ? data[1] : data[0]))
                .curve(curveFunction)
        ;



        return <g>
            {
                y.scaledData.map((set, index) => line(lineComponent, {
                    fill: area ? color[index]: 'none',
                    stroke: area ? 'none' : color[index],
                    d: generator(set)
                }))
            }
        </g>;
    }
}



export default Line;
