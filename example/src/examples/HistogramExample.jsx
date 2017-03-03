import {Histogram, Svg, Chart} from 'pnut';
import React from 'react';
import {ElementQueryHock} from 'stampy';
import data from '../data/lineData';

class HistogramExample extends React.Component {
    render() {
        const binnedData = data.bin('month', (values, min, max, generators) => {
            console.log(values, min, max);
            return generators.freedmanDiaconis(values, min, max);
        }, null, row => {
            return row.map(value => value.reduce((a,b) => a + b, 0));
        });

        // const binnedData = data.bin('month', null, null, row => {
        //     return row.map(value => value.reduce((a,b) => a + b, 0));
        // });

        return  <Chart
            dimensions={['x', 'y']}
            width={this.props.eqWidth}
            height={this.props.eqHeight}
            data={binnedData}
            xColumn={['monthLower', 'monthUpper']}
        >
            <Histogram yColumn='supply'/>
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
