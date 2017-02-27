import {Pie, Svg, Chart} from 'pnut';
import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
import {ElementQueryHock} from 'stampy';
import data from '../data/columnData';
import {easeBounce} from 'd3-ease';

class PieExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            endAngle: 0
        };
        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        this.tick();
    }

    tick() {
        const increment = 0.01;
        if(this.state.endAngle + increment > 1) {
            this.setState({
                endAngle: 1
            })
        }
        this.setState({
            endAngle: this.state.endAngle += increment
        });

        window.requestAnimationFrame(this.tick);
    }

    render() {
        const colors = [
            "#7fc97f",
            "#beaed4",
            "#fdc086",
            "#ffff99",
            "#386cb0",
            "#f0027f",
            "#bf5b17",
            "#666666"
        ];

        return  <Chart
            dimensions={['arc', 'category']}
            width={this.props.eqWidth}
            height={this.props.eqHeight}
            data={data}
            categoryColumn='property_type'
            categoryScaleType='scaleOrdinal'
            categoryScaleUpdate={(scale) => scale.range(colors)}
            arcColumn='demand'
            arcScaleType='scaleLinear'
            arcScaleUpdate={scale => scale
                .domain([0, data.sum('demand')])
                .range([0, easeBounce(this.state.endAngle) * Math.PI * 2])
            }
            arc={(props) => {
                return <path
                    {...props.arcProps}
                    stroke='none'
                />
            }}
        >
            <Pie/>
        </Chart>;
    }
}

const HockedExample = ElementQueryHock([])(PieExample);

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


