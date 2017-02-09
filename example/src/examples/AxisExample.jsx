import {ColumnRenderable, AxisRenderable, ChartData, Gridlines, Canvas} from 'pnut';
import React from 'react';
import {scaleLog, scaleLinear, scaleBand} from 'd3-scale';
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


class AxisExample extends React.Component {
    render() {
        const {eqWidth, eqHeight} = this.props;
        const yScale = scaleLog()
            .domain([chartData.min(['supply', 'demand']), chartData.max(['supply', 'demand'])])
            .range([0, this.props.eqHeight - 100])
            .base(10)
            .nice();

        const xScale = scaleBand()
            .domain(rows.map(row => row.property_type))
            .range([0, this.props.eqWidth - 100])
            .padding(0.1);

        const scaleLabel = scaleLinear()
            .domain([0, 1280])
            .range([90, 0])
            .clamp(true);


        return <div width={eqWidth} height={eqHeight}>
            <div style={{
                position: 'absolute',
                zIndex: 5,
                bottom: 0,
                height: '50px',
                left: '50px'
            }}>
                <Canvas width={eqWidth} height={eqHeight}>
                    <AxisRenderable
                        width={this.props.eqWidth - 100}
                        height={50}
                        position='bottom'
                        ticks={() => rows.map(row => row.property_type)}
                        scale={xScale}
                    />
                </Canvas>
            </div>
            <div style={{
                position: 'absolute',
                zIndex: 5,
                top: 0,
                height: '50px',
                left: '50px'
            }}>
                <Canvas width={eqWidth} height={eqHeight}>
                    <AxisRenderable
                        width={this.props.eqWidth - 100}
                        height={50}
                        position='top'
                        ticks={() => rows.map(row => row.property_type)}
                        scale={xScale}
                    />
                </Canvas>
            </div>

            <div style={{
                position: 'absolute',
                zIndex: 5,
                top: '50px',
                left: 0
            }}>
                <Canvas width={eqWidth} height={eqHeight}>
                    <AxisRenderable
                        width={50}
                        height={this.props.eqHeight - 100}
                        position='left'
                        ticks={() => yScale.ticks(3)}
                        scale={yScale}
                    />
                </Canvas>
            </div>

            <div style={{
                position: 'absolute',
                zIndex: 5,
                top: '50px',
                right: 0
            }}>
                <Canvas width={50} height={eqHeight}>
                    <AxisRenderable
                        width={50}
                        height={this.props.eqHeight - 100}
                        position='right'
                        ticks={() => yScale.ticks(3)}
                        scale={yScale}
                    />
                </Canvas>
            </div>
            <div style={{
                position: 'absolute',
                top: '50px',
                left: '50px',
                zIndex: 2
            }}>
                <Canvas width={eqWidth} height={eqHeight}>
                    <ColumnRenderable
                        width={this.props.eqWidth - 100}
                        height={this.props.eqHeight - 100}
                        xScale={xScale}
                        yScale={yScale}
                        xColumn={'property_type'}
                        yColumn={['supply', 'demand']}
                        data={chartData}
                        columnProps={[
                            {
                                fill: '#285BE9'
                            },
                            {
                                fill: '#EA3D27'
                            }
                        ]}
                    />
                </Canvas>
            </div>
            <div style={{
                position: 'absolute',
                top: '50px',
                left: '50px',
                zIndex: 1
            }}>
                <Canvas width={eqWidth} height={eqHeight}>
                    <Gridlines
                        width={this.props.eqWidth - 100}
                        height={this.props.eqHeight - 100}
                        xScale={xScale}
                        yScale={yScale}
                        ticksX={() => rows.map(row => row.property_type)}
                        ticksY={() => yScale.ticks(Math.round(this.props.eqHeight / 100))}
                        lineHorizontal={(props) => {
                            const {coordinates, tick, scale} = props;
                            return <line {...coordinates} strokeWidth="1" stroke="rgba(0,0,0,0.2)"/>
                        }}

                        lineVertical={(props) => {
                            const {coordinates, tick} = props;
                            return <rect x={coordinates.x1 - xScale.bandwidth() / 2} y={coordinates.y1} width={xScale.bandwidth()} height={coordinates.y2 - coordinates.y1} fill='rgba(0,0,0,0.1)'/>
                        }}
                    />
                </Canvas>
            </div>

        </div>
    }
}

const HockedExample = ElementQueryHock([])(AxisExample);

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
