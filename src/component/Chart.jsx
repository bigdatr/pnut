// @flow
import type {Node} from 'react';
import type {ChartRow} from '../definitions';
import type {DimensionConfig} from '../useScales';

import React from 'react';
import Svg from './Svg';
import ChartData from '../chartdata/ChartData';



type Props<Data> = {
    children: Function,
    data: Data,
    dimensions: Array<DimensionConfig>,
    height: number,
    padding: [number, number, number, number],
    width: number,

    style?: Object
};

class Chart<Data: ChartData<ChartRow>> extends React.PureComponent<Props<Data>> {
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
