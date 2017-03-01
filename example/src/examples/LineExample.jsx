import {Line, Svg, Chart} from 'pnut';
import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
import {ElementQueryHock} from 'stampy';
import data from '../data/lineData';

class LineExample extends React.Component {
    render() {
        const binnedData = data.bin('month', null, null, undefined, row => {
            return row.map(value => value.reduce((a,b) => a + b, 0));
        });


        return  <Chart
            width={this.props.eqWidth}
            height={this.props.eqHeight}
            data={data}
            xColumn='month'
            yColumn='supply'
        >
            <Line />
        </Chart>;
    }
}

const HockedExample = ElementQueryHock([])(LineExample);

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
