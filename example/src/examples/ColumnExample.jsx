import {Column, Svg, Chart} from 'pnut';
import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
import ElementQueryHock from 'stampy/lib/hock/ElementQueryHock';
import data from '../data/columnData';

class ColumnExample extends React.Component {
    render() {
        return  <Chart
            width={this.props.eqWidth}
            height={this.props.eqHeight}
            data={data}
            xColumn='property_type'
            yColumn='demand'
            xScaleUpdate={scale => scale.padding(0.1)}
        >
            <Column/>
        </Chart>;
    }
}

const HockedExample = ElementQueryHock([])(ColumnExample);

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
