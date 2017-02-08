import {Svg, LineRenderable, ChartData, InteractionRenderable, ScatterRenderable} from 'pnut';
import React from 'react';
import {scaleLinear, scaleBand} from 'd3-scale';
import {ElementQueryHock} from 'stampy';
import {List} from 'immutable';

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


const chartData = new ChartData(rows, columns);


class CanvasExample extends React.Component {
    constructor(props) {
        super(props);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handleDrawBox = this.handleDrawBox.bind(this);
        this.state = {
            rowsInBox: List()
        };

    }

    handlePointerMove(pointers) {
        console.log(pointers.toJS()[0].fromStart);
        // const nearest = distances.distanceX.get('default').minBy(row => row.get('distance'));
        // this.setState({nearestRow: nearest.get('rowIndex')});

        // const threshold = 20;
        // const nearest = distances.distanceXY.get('default').minBy(row => row.get('distance'));
        // this.setState({nearestRow: nearest.get('distance') <= threshold ? nearest.get('rowIndex') : null});
    }

    handleDrawBox({box, insideBox}) {

        // this.setState({
        //     box: box,
        //     rowsInBox: insideBox.get('default').map(row => row.get('rowIndex'))
        // })
    }
    render() {
        const yScale = scaleLinear()
            .domain([chartData.min('supply'), chartData.max('supply')])
            .range([0, this.props.eqHeight])
            .nice();

        const xScale = scaleBand()
            .domain(rows.map(row => row.month))
            .range([0, this.props.eqWidth]);

        return <div>
            <Svg width={this.props.eqWidth} height={this.props.eqHeight}>
                <LineRenderable
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
                        stroke: 'white'
                    }}
                />

                <ScatterRenderable
                    xScale={xScale}
                    yScale={yScale}
                    xColumn={'month'}
                    yColumn={'supply'}
                    data={chartData}
                    dot={
                        ({x, y, dataX, dataY, index}) => <circle
                            cx={x}
                            cy={y}
                            fill={index === this.state.nearestRow || this.state.rowsInBox.contains(index) ? 'red' : 'white'}
                            r={10}
                        />
                    }
                />

                {
                    this.state.box && <rect
                        x={this.state.box.x}
                        y={this.state.box.y}
                        width={this.state.box.width}
                        height={this.state.box.height}
                        stroke={'#ccc'}
                        fill={'rgba(255,255,255,0.2)'}
                    />
                }

                <InteractionRenderable
                    width={this.props.eqWidth}
                    height={this.props.eqHeight}
                    scaleGroups={['default']}
                    xScales={[xScale]}
                    yScales={[yScale]}
                    xColumns={[['month']]}
                    yColumns={[['supply']]}
                    data={chartData}
                    onPointerMove={this.handlePointerMove}
                    onDrawBox={this.handleDrawBox}
                    onClick={() => console.log('click')}
                />


            </Svg>

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
            overflow: 'hidden',
            background: '#200A30'
        }}
    ><HockedExample/></div>
};
