import {ColumnCanvas, ChartData} from 'pnut';
import React from 'react';
import {scaleLog, scaleBand} from 'd3-scale';
import {ElementQueryHock} from 'stampy';

const columns = [
    {
        key: 'supply',
        label: 'Supply',
        isContinuous: true
    },
    {
        key: 'demand',
        label: 'Demand',
        isContinuous: true
    },
    {
        key: 'property_type',
        label: 'Property Type',
        isContinuous: false
    }
];

const rows = [
    {
        demand: 2316,
        property_type: "Townhouse",
        supply: 312
    },
    {
        demand: 4487,
        property_type: "Villa",
        supply: 5
    },
    {
        demand: 1275,
        property_type: "Land",
        supply: 38
    },
    {
        demand: 707,
        property_type: "Apartment",
        supply: 264
    },
    {
        demand: 3681,
        property_type: "Unit",
        supply: 94
    },
    {
        demand: 4544,
        property_type: "House",
        supply: 2151
    },
    {
        demand: 2560,
        property_type: "Other",
        supply: 5
    }
];


const chartData = new ChartData(rows, columns);


class CanvasExample extends React.Component {
    render() {
        const scaleY = scaleLog()
            .domain([chartData.min(['supply', 'demand']), chartData.max(['supply', 'demand'])])
            .range([0, this.props.eqHeight])
            .nice();

        const scaleX = scaleBand()
            .domain(rows.map(row => row.property_type))
            .range([0, this.props.eqWidth])
            .padding(0.1);

        return <div>
            <div style={{position: 'absolute', top: 0, left: 0}}>
                <ColumnCanvas
                    width={this.props.eqWidth}
                    height={this.props.eqHeight}
                    scaleX={scaleX}
                    scaleY={scaleY}
                    columnX={'property_type'}
                    columnY={['supply', 'demand']}
                    data={chartData}
                    columnProps={[
                        {
                            fill: 'blue'
                        },
                        {
                            fill: 'red'
                        }
                    ]}
                />;
            </div>

        </div>
    }
}

const HockedExample = ElementQueryHock([])(CanvasExample);

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
