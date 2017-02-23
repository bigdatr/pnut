import {Area, Svg, Chart} from 'pnut';
import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
import {ElementQueryHock} from 'stampy';
import data from '../data/lineData';

class AreaExample extends React.Component {
    render() {
        return  <Chart
            width={this.props.eqWidth}
            height={this.props.eqHeight}
            data={data}
            xColumn='month'
            yColumn='supply'
            xScaleType='scalePoint'
        >
            <Area curveSelector={curves => curves.curveMonotoneX}/>
        </Chart>;
    }
}

const HockedExample = ElementQueryHock([])(AreaExample);

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
