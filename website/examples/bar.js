import {Bar, Svg, Chart} from 'pnut';
import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
import {ElementQueryHock} from 'stampy';
import data from '../data/columnData';

class BarExample extends React.Component {
    render() {
        return  <Chart
            width={this.props.eqWidth}
            height={this.props.eqHeight}
            data={data}
            yColumn='property_type'
            xColumn='demand'
            yScaleUpdate={scale => scale.padding(0.1)}
        >
            <Bar/>
        </Chart>;
    }
}

const HockedExample = ElementQueryHock([])(BarExample);

export default () => {
    return <div
        style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            overflow: 'hidden'
        }}
    ><HockedExample/></div>
};
