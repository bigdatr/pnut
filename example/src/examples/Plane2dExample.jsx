import {Line, ChartData, Chart, Scatter, Column} from 'pnut';
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




// console.log(chartData);


class Axis extends React.Component {
    static chartType = 'axis';

    render() {
        const {label, scaleName} = this.props;
        if(this.props[scaleName]) {
            const domain = this.props[scaleName].domain();
            return <text y={this.props.yPos}>Axis of {this.props.label} from {domain[0]} to {domain[domain.length - 1]}</text>
        }

        return <g></g>
    }
}

class Plane2dExample extends React.Component {
    render() {
        const chartData = (new ChartData(rows, columns)).mapRows(ii => {
            return ii
                .set('randomDemand', ii.get('demand') + ((Math.random() - 0.5) * 1000000))
                .set('benchmark', 1800000);
        });

        const props = {
            xDimension: "month",
            xScaleType:"scaleBand",
            xScale: scale => scale.align(.5),
            yDimension: ['demand']
        }


        return <div>
            <div style={{position: 'absolute', top: 0, left: 0}}>
                <Chart
                    padding={[0,0,0,0]}
                    data={chartData}
                    width={this.props.eqWidth || 0}
                    height={this.props.eqHeight || 0}
                    {...props}
                >

                    <Column yDimension="demand" columnProps={{fill: 'blue', opacity: .5}} />
                    <Column yDimension={'supply'} columnProps={{fill: 'red', opacity: .5}} />
                    <Line yDimension="benchmark" xScaleType="scalePoint" pathProps={{stroke: 'gray', strokeWidth: 2}}/>
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
