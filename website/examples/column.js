import {Column, Svg, Chart} from 'pnut';
import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
import {ElementQueryHock} from 'stampy';
import data from '../data/columnData';

class ColumnExample extends React.Component {
    render() {
        return  <Chart
            width={this.props.eqWidth}
            height={this.props.eqHeight}
            data={data}
            xColumn='property_type'
        >
            <Column yColumn='demand' columnProps={{fill: 'blue', stroke: 'none'}} xScaleUpdate={scale => scale.padding(0.7).align(0.233333333)}/>
            <Column yColumn='supply' columnProps={{fill: 'red',  stroke: 'none'}} xScaleUpdate={scale => scale.padding(0.7).align(.466666667)}/>
            <Column yColumn='other' columnProps={{fill: 'green',  stroke: 'none'}} xScaleUpdate={scale => scale.padding(0.7).align(0.7)}/>
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
