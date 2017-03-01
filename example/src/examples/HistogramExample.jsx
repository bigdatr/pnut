import {Histogram, Svg, Chart} from 'pnut';
import React from 'react';
import {ElementQueryHock} from 'stampy';
import data from '../data/columnData';

class HistogramExample extends React.Component {
    render() {
        return  <Chart
            width={this.props.eqWidth}
            height={this.props.eqHeight}
            data={data}
            xColumn='property_type'
        >
            <Histogram yColumn='demand'/>
        </Chart>;
    }
}

const HockedExample = ElementQueryHock([])(HistogramExample);

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
