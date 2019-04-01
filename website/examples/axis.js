import {Column, Axis, Chart, Line, Scatter} from 'pnut';
import React from 'react';
import {ElementQueryHock} from 'stampy';

import columnData from '../data/columnData';



class AxisExample extends React.Component {
    render() {
        const {eqWidth, eqHeight} = this.props;

        const chartProps = {
            width: eqWidth || 0,
            height: eqHeight || 0,
            padding: [64,64,64,80],
            xColumn: "property_type",
            radiusColumn: "supply",
            data: columnData,
        }

        const dot = ({dotProps, dimensions}) => <circle {...dotProps} r={dimensions.radius}></circle>

        return <Chart {...chartProps} dimensions={['x', 'y', 'radius']}>
            <Axis position="top" dimension="x" />
            <Axis location={2500} position="top" dimension="x" />
            <Axis location={"Apartment"} position="left" dimension="y" />
            <Axis position="bottom" dimension="x" />
            <Axis position="left" dimension="y" yColumn="supply"/>
            <Axis position="right" dimension="y" yColumn="demand"/>
            <Column yColumn="supply" />
            <Scatter yColumn="demand" radiusScaleUpdate={ss => ss.range([50,500])} dot={dot}/>
            <Line yColumn="demand" />
        </Chart>
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
