import {Line, ChartData, Chart, Scatter, Column, Axis, Gridlines, Benchmark} from 'pnut';
import React from 'react';
import ElementQueryHock from 'stampy/lib/hock/ElementQueryHock';
import moment from 'moment';

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
            data: chartData
        }

        // const xScaleTicks = scale => scale;

        const gridlines = <Gridlines lineHorizontal={lightLine} lineVertical={lightLine}/>;
        return <div>
            <div style={{position: 'absolute', top: 0, left: 0}}>

                <Chart {...chartProps} stroke="#555"
                    padding={[]}
                    yScaleUpdate={scale => scale.domain([-chartData.max('supply'), chartData.max('supply')])}
                >
                    {gridlines}
                    <Benchmark labelOffset={[0, -20]} label="Rad Stuff" location={2000} dimension="y" />
                    <Benchmark labelOffset={[0, -20]} label="Rad Stuff" location={moment().subtract(2, 'year').toDate()} dimension="x" />
                    <Axis position='bottom' dimension="x" />
                    <Axis location={moment().subtract(1, 'year').toDate()} position='left' dimension="y" yColumn="supply"/>
                    <Line yColumn="supply" pathProps={{stroke: 'red', strokeWidth: 2}}/>
                </Chart>

                <Chart {...chartProps}>
                    {gridlines}
                    <Axis position='bottom' dimension="x" location={chartData.median('supply')} />
                    <Axis position='left' dimension="y" yColumn="supply"/>
                    <Line yColumn="supply" pathProps={{stroke: 'red', strokeWidth: 2}}/>
                </Chart>

                <Chart {...chartProps} xColumn="month">
                    <Axis position='bottom' dimension="x"/>
                    <Chart yColumn="supply">
                        <Axis position='left' dimension="y"/>
                        <Line />
                        <Scatter />
                    </Chart>
                    <Chart yColumn="demand">
                        <Axis position='right' dimension="y"/>
                        <Scatter />
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
