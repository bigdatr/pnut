import {Line, ChartData, Chart, Scatter, Column, Axis, Gridlines} from 'pnut';
import React from 'react';
import {ElementQueryHock} from 'stampy';

import lineData from '../data/lineData';

const lightLine = (props: LineProps): React.Element<any> => {
    const {coordinates} = props;
    return <line {...coordinates} strokeWidth="1" stroke="#eee"/>;
};

class Plane2dExample extends React.Component {
    render() {
        const chartData = lineData;

        const chartProps = {
            width: 800,
            height: 500,
            padding: [64,64,64,80],
            xColumn: "month",
            data: chartData,
            xScaleType: 'scalePoint'
        }

        const xScaleTicks = scale => scale.domain().filter((ii, key) => key % 4 === 0);

        const gridlines = <Gridlines lineHorizontal={lightLine} lineVertical={lightLine}/>;

        return <div>
            <div style={{position: 'absolute', top: 0, left: 0}}>

                <Chart {...chartProps} stroke="#555"
                    padding={[]}
                    yScaleUpdate={scale => scale.domain([-chartData.max('supply'), chartData.max('supply')])}
                >
                    {gridlines}
                    <Axis location={0} ticks={xScaleTicks} position='top' dimension="x" />
                    <Axis location={'2015-05-01'} position='left' dimension="y" yColumn="supply"/>
                    <Line yColumn="supply" pathProps={{stroke: 'red', strokeWidth: 2}}/>
                </Chart>

                <Chart {...chartProps}>
                    {gridlines}
                    <Axis ticks={xScaleTicks} position='bottom' dimension="x" location={chartData.median('supply')} />
                    <Axis position='left' dimension="y" yColumn="supply"/>
                    <Line yColumn="supply" pathProps={{stroke: 'red', strokeWidth: 2}}/>
                </Chart>

                <Chart {...chartProps} xColumn="month">
                    <Axis position='bottom' dimension="x"/>
                    <Chart yColumn="supply">
                        <Axis position='left' dimension="y"/>
                        <Line />
                        <Scatter />
                        <Column />
                    </Chart>
                    <Chart yColumn="demand">
                        <Axis position='right' dimension="y"/>
                        <Scatter />
                        <Column />
                        <Line />
                    </Chart>
                </Chart>
            </div>
        </div>
    }
}

const HockedExample = ElementQueryHock([])(Plane2dExample);


export default () => {
    return <div
        style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0
        }}
    ><HockedExample/></div>
};
