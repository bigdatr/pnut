import {Scatter, Svg, Chart} from 'pnut';
import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
import {ElementQueryHock} from 'stampy';
import data from '../data/lineData';

class ScatterExample extends React.Component {
    render() {
        return  <Chart
            dimensions={['x', 'y', 'radius']}
            width={this.props.eqWidth}
            height={this.props.eqHeight}
            data={data}
            xColumn='month'
            yColumn='supply'
            radiusColumn='demand'
            radiusScaleUpdate={scale => scale.range([10, 40])}
        >
            <Scatter dot={props => <circle {...props.dotProps} fill='black' r={props.dimensions.radius}/>}/>
        </Chart>;
    }
}

const HockedExample = ElementQueryHock([])(ScatterExample);

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
