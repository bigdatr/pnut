import {LineCanvas, ChartData, Canvas} from 'pnut';
import React from 'react';
import {scaleLinear, scalePoint} from 'd3-scale';
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
    }
];

const rows = [
    {
        month: "2014-01-01",
        supply: 123605,
        demand: 280000
    },
    {
        month: "2014-02-01",
        supply: 457959,
        demand: 720000
    },
    {
        month: "2014-03-01",
        supply: 543558,
        demand: 960000
    },
    {
        month: "2014-04-01",
        supply: 657625,
        demand: 107000
    },
    {
        month: "2014-05-01",
        supply: 724687,
        demand: 116000
    },
    {
        month: "2014-06-01",
        supply: 577673,
        demand: 930000
    },
    {
        month: "2014-07-01",
        supply: 510476,
        demand: 850000
    },
    {
        month: "2014-08-01",
        supply: 587977,
        demand: 104000
    },
    {
        month: "2014-09-01",
        supply: 589351,
        demand: 121000
    },
    {
        month: "2014-10-01",
        supply: 557710,
        demand: 138000
    },
    {
        month: "2014-11-01",
        supply: 550750,
        demand: 139000
    },
    {
        month: "2014-12-01",
        supply: 240661,
        demand: 950000
    },
    {
        month: "2015-01-01",
        supply: 278804,
        demand: 870000
    },
    {
        month: "2015-02-01",
        supply: 785962,
        demand: 141000
    },
    {
        month: "2015-03-01",
        supply: 713841,
        demand: 129000
    },
    {
        month: "2015-04-01",
        supply: 681580,
        demand: 1320000
    },
    {
        month: "2015-05-01",
        supply: 930395,
        demand: 1390000
    },
    {
        month: "2015-06-01",
        supply: 937566,
        demand: 1090000
    },
    {
        month: "2015-07-01",
        supply: 1011621,
        demand: 1260000
    },
    {
        month: "2015-08-01",
        supply: 1638135,
        demand: 1540000
    },
    {
        month: "2015-09-01",
        supply: 1209174,
        demand: 1380000
    },
    {
        month: "2015-10-01",
        supply: 1060541,
        demand: 1370000
    },
    {
        month: "2015-11-01",
        supply: 1236615,
        demand: 1700000
    },
    {
        month: "2015-12-01",
        supply: 629503,
        demand: 125000
    },
    {
        month: "2016-01-01",
        supply: 678891,
        demand: 109000
    },
    {
        month: "2016-02-01",
        supply: 1681174,
        demand: 1630000
    },
    {
        month: "2016-03-01",
        supply: 1209983,
        demand: 1400000
    },
    {
        month: "2016-04-01",
        supply: 1380393,
        demand: 1490000
    },
    {
        month: "2016-05-01",
        supply: 1267107,
        demand: 1510000
    },
    {
        month: "2016-06-01",
        supply: 1371218,
        demand: 1540000
    },
    {
        month: "2016-07-01",
        supply: 1652395,
        demand: 1600000
    },
    {
        month: "2016-08-01",
        supply: 1561521,
        demand: 1810000
    },
    {
        month: "2016-09-01",
        supply: 1896226,
        demand: 2180000
    },
    {
        month: "2016-10-01",
        supply: 1810362,
        demand: 2270000
    },
    {
        month: "2016-11-01",
        supply: 1877047,
        demand: 2470000
    },
    {
        month: "2016-12-01",
        supply: 770154,
        demand: 2040000
    }
];


const chartData = new ChartData(rows, columns);


class CanvasExample extends React.Component {
    render() {
        const yScale = scaleLinear()
            .domain([chartData.min('supply'), chartData.max('supply')])
            .range([0, this.props.eqHeight])
            .nice();

        const xScale = scalePoint()
            .domain(rows.map(row => row.month))
            .range([0, this.props.eqWidth]);

        return <div>
            <div style={{position: 'absolute', top: 0, left: 0}}>
                <Canvas width={this.props.eqWidth} height={this.props.eqHeight}>
                    <LineCanvas
                        width={this.props.eqWidth}
                        height={this.props.eqHeight}
                        xScale={xScale}
                        yScale={yScale}
                        xColumn={'month'}
                        yColumn={'supply'}
                        data={chartData}
                        svgProps={{
                            strokeWidth: '2'
                        }}
                        pathProps={{
                            strokeWidth: '2',
                            stroke: "#000"
                        }}
                    />
                </Canvas>
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
            left: 0
        }}
    ><HockedExample/></div>
};
