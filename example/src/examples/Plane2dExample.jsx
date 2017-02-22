import {Line, ChartData, Chart, Scatter, Column, Axis, Gridlines} from 'pnut';
import React from 'react';
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
        key: 'month',
        label: 'Month',
        isContinuous: false
    },
    {
        key: 'randomDemand',
        label: 'Random Demand',
        isContinuous: true
    },
    {
        key: 'benchmark',
        label: 'Bench Mark'
    }
];

const rows = [
    {
        month: "2014-01-01",
        supply: 123605,
        demand: 28
    },
    {
        month: "2014-02-01",
        supply: 457959,
        demand: 72
    },
    {
        month: "2014-03-01",
        supply: 543558,
        demand: 96
    },
    {
        month: "2014-04-01",
        supply: 657625,
        demand: 107
    },
    {
        month: "2014-05-01",
        supply: 724687,
        demand: 116
    },
    {
        month: "2014-06-01",
        supply: 577673,
        demand: 93
    },
    {
        month: "2014-07-01",
        supply: 510476,
        demand: 85
    },
    {
        month: "2014-08-01",
        supply: 587977,
        demand: 104
    },
    {
        month: "2014-09-01",
        supply: 589351,
        demand: 121
    },
    {
        month: "2014-10-01",
        supply: 557710,
        demand: 138
    },
    {
        month: "2014-11-01",
        supply: 550750,
        demand: 139
    },
    {
        month: "2014-12-01",
        supply: 240661,
        demand: 95
    },
    {
        month: "2015-01-01",
        supply: 278804,
        demand: 87
    },
    {
        month: "2015-02-01",
        supply: 785962,
        demand: 141
    },
    {
        month: "2015-03-01",
        supply: 713841,
        demand: 129
    },
    {
        month: "2015-04-01",
        supply: 681580,
        demand: 132
    },
    {
        month: "2015-05-01",
        supply: 930395,
        demand: 139
    },
    {
        month: "2015-06-01",
        supply: 937566,
        demand: 109
    },
    {
        month: "2015-07-01",
        supply: 1011621,
        demand: 126
    },
    {
        month: "2015-08-01",
        supply: 1638135,
        demand: 154
    },
    {
        month: "2015-09-01",
        supply: 1209174,
        demand: 138
    },
    {
        month: "2015-10-01",
        supply: 1060541,
        demand: 137
    },
    {
        month: "2015-11-01",
        supply: 1236615,
        demand: 170
    },
    {
        month: "2015-12-01",
        supply: 629503,
        demand: 125
    },
    {
        month: "2016-01-01",
        supply: 678891,
        demand: 109
    },
    {
        month: "2016-02-01",
        supply: 1681174,
        demand: 163
    },
    {
        month: "2016-03-01",
        supply: 1209983,
        demand: 140
    },
    {
        month: "2016-04-01",
        supply: 1380393,
        demand: 149
    },
    {
        month: "2016-05-01",
        supply: 1267107,
        demand: 151
    },
    {
        month: "2016-06-01",
        supply: 1371218,
        demand: 154
    },
    {
        month: "2016-07-01",
        supply: 1652395,
        demand: 160
    },
    {
        month: "2016-08-01",
        supply: 1561521,
        demand: 181
    },
    {
        month: "2016-09-01",
        supply: 1896226,
        demand: 218
    },
    {
        month: "2016-10-01",
        supply: 1810362,
        demand: 227
    },
    {
        month: "2016-11-01",
        supply: 1877047,
        demand: 247
    },
    {
        month: "2016-12-01",
        supply: 770154,
        demand: 204
    }
];


class Plane2dExample extends React.Component {
    render() {
        const chartData = (new ChartData(rows, columns)).mapRows(ii => {
            return ii
                .set('randomDemand', ii.get('demand') + ((Math.random() - 0.5) * 1000000))
                .set('benchmark', 1300000);
        });


        const data = new ChartData([{x: 1, y: 1},{x: 2, y: 2},{x: 3, y: 3},{x: 4, y: 4},{x: 5, y: 5}], [{key: 'x', isContinuous: false}, {key: 'y', isContinuous: false}]);

        const path = ({d}) => <path d={d} stroke="red"/>;

        return <Chart
            padding={[32,32,32,32]}
            data={data}
            width={500}
            height={500}
            xColumn="x"
            yColumn="y"
        >
            <Scatter pathProps={{stroke: 'red', strokeWidth: 2}}/>
            <Gridlines/>
            <Axis
                position='bottom'
                dimension="x"
            />
            <Axis
                position='left'
                dimension="y"
            />
        </Chart>;

        return <div>
            <div style={{position: 'absolute', top: 0, left: 0}}>
                <Chart
                    padding={[64,64,64,90]}
                    data={chartData}
                    width={this.props.eqWidth || 0}
                    height={this.props.eqHeight || 0}
                    dimensions={['x', 'y']}
                    xColumn="month"
                >

                    <Line yScaleGroup="y1" yColumn="supply" pathProps={{stroke: 'red', strokeWidth: 2}}/>
                    <Line yScaleGroup="y2" yColumn="demand" pathProps={{stroke: 'blue', strokeWidth: 2}}/>


                    <Axis
                        position='bottom'
                        dimension="x"
                    />
                    <Axis
                        position='left'
                        dimension="y"
                        yColumn="supply"
                        yScaleGroup="y1"
                    />
                    <Axis
                        position='right'
                        dimension="y"
                        yColumn="fooBar"
                        yScaleGroup="y2"
                    />


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
