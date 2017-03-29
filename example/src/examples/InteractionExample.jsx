import {Scatter, Line,  Group, Animation, Svg, Chart} from 'pnut';
import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
import {ElementQueryHock} from 'stampy';
import data from '../data/lineData';


class InteractionWrapper extends React.Component {
    static chartType = 'wrapper';
    static augmentChildProps

    render() {
        console.log(this.props);
        return <g>{this.props.children}</g>
    }

}

class ScatterExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: data
        };

    }

    componentDidMount() {
        setInterval(() => {
            this.setState({
                data: data.mapRows(row => {
                    return row
                        .set('supply', row.get('supply') * Math.random())
                        .set('demand', row.get('demand') * Math.random());
                })
            })
        }, 2000);
    }
    render() {
        return  <Chart
            dimensions={['x', 'y', 'radius']}
            width={this.props.eqWidth}
            height={this.props.eqHeight}
            data={this.state.data}
            xColumn='month'
            yColumn='supply'
            radiusColumn='demand'
            radiusScaleUpdate={scale => scale.range([10, 40])}
        >
            <Group>
                <Animation>
                    <Scatter id='scatter' dot={props => <circle {...props.dotProps} fill='black' r={props.dimensions.radius}/>}/>
                    <Line id='line' curveSelector={(curves) => curves.curveMonotoneX}/>
                </Animation>
            </Group>
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
