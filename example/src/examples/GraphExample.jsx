import {Graph, Svg, Chart} from 'pnut';
import React from 'react';
import {ElementQueryHock} from 'stampy';

class GraphExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amplitude: 1,
            period: 1
        };
    }
    render() {
        // data={(x) => -1 * ((2 * this.state.amplitude) / Math.PI) * Math.atan(1 / Math.tan((x * Math.PI) / this.state.period))}
        return  <div>
            <Chart
                width={this.props.eqWidth}
                height={this.props.eqHeight}
                data={x => Math.sin(x * this.state.period) * this.state.amplitude}
                xScaleType='scaleLinear'
                yScaleType='scaleLinear'
                yScaleUpdate={scale => scale.domain([-1, 1])}
                xScaleUpdate={scale => scale.domain([-Math.PI, Math.PI])}
                xColumn='x'
                yColumn='y'
            >
                <Graph />
            </Chart>
            <input style={{
                position: 'absolute',
                width: '300px',
                top: '50px',
                right: '50px'
            }} type="range" value={this.state.amplitude} min={0.1} max={5} step={0.1} onChange={(ee) => this.setState({amplitude: parseFloat(ee.target.value)})}/>
            <input style={{
                position: 'absolute',
                width: '300px',
                top: '100px',
                right: '50px'
            }} type="range" value={this.state.period} min={0.1} max={5} step={0.1} onChange={(ee) => this.setState({period: parseFloat(ee.target.value)})}/>
        </div>;
    }
}

const HockedExample = ElementQueryHock([])(GraphExample);

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
