// @flow
import type {Node} from 'react';
import type {ChartRow} from '../definitions';
import type {DimensionConfig} from '../useScales';

import React from 'react';
import Svg from './Svg';
import useScales from '../useScales';
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
        const {data} = this.props;
        const {width} = this.props;
        const {height} = this.props;
        const {children} = this.props;
        const {style} = this.props;
        const {padding = []} = this.props;
        const [top = 0, right = 0, bottom = 0, left = 0] = padding;
        const dimensions = useScales(this.props.dimensions)(data);
        const viewBox = `${-left} ${-top} ${width + left + right} ${height + top + bottom}`;

        return <Svg width={width} height={height} svgProps={{style, viewBox}}>
            {children(dimensions)}
        </Svg>;
    }
}

export default Chart;
