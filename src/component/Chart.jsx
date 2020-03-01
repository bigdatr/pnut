// @flow
import type {Node} from 'react';

import React from 'react';
import Svg from './Svg';



type Props = {
    children: Node,
    height: number,
    padding?: {top?: number, bottom?: number, left?: number, right?: number},
    width: number,
    style?: Object
};

class Chart extends React.PureComponent<Props> {
    render(): Node {
        const {width} = this.props;
        const {height} = this.props;
        const {padding = {}} = this.props;
        const {left = 0, right = 0, bottom = 0, top = 0} = padding;
        const {children} = this.props;
        const {style} = this.props;

        return <Svg width={width + left + right} height={height + top + bottom} svgProps={{style}}>
            <g transform={`translate(${left}, ${top})`}>
                {children}
            </g>
        </Svg>;
    }
}

export default Chart;
