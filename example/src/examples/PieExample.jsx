import {Pie, Svg, Chart} from 'pnut';
import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
import {ElementQueryHock} from 'stampy';
import data from '../data/columnData';

class LineExample extends React.Component {
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
            dimensions={['arc', 'category', 'radius']}
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
                .range([0, Math.PI * 2])
            }
            radiusColumn='supply'
            radiusScaleUpdate={scale => scale.range([Math.min(this.props.eqHeight, this.props.eqWidth) / 4, Math.min(this.props.eqHeight, this.props.eqWidth) / 2])}
            arc={(props) => {
                return <path
                    {...props.arcProps}
                    stroke='none'
                    d={
                        props.arcGenerator
                            .outerRadius(props.dimensions.radius)
                            .cornerRadius(10)()
                    }
                />
            }}
        >
            <Pie/>
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


