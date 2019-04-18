import React from 'react';
import Chart from '../Chart';
import Line from '../canvas/LineRenderable';
import ChartData from '../../chartdata/ChartData';

const columns = [
    {
        key: 'supply'
    },
    {
        key: 'month'
    },
    {
        key: 'demand'
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
        supply: 457959,
        demand: 720000
    }
];

const data = new ChartData(rows, columns);


it('will create a viewbox from padding', () => {
    const chart = shallow(<Chart
        dimensions={[{columns: ['supply'], range: [0,0]}]}
        padding={[64,64,64,64]}
        width={1000}
        height={1000}
        data={data}
        children={jest.fn()}
    />);

    expect(chart.prop('svgProps').viewBox).toBe('-64 -64 1128 1128');

});

it('will set width and height', () => {
    const chart = shallow(<Chart
        dimensions={[{columns: ['supply'], range: [0,0]}]}
        width={1000}
        height={2000}
        data={data}
        children={jest.fn()}
    />);

    expect(chart).toHaveProp({width: 1000, height: 2000});
});

it('will call the children with dimensions', () => {
    const children = jest.fn();
    const chart = shallow(<Chart
        dimensions={[
            {columns: ['supply'], range: [0,0]},
            {columns: ['demand'], range: [0,0]},
        ]}
        padding={[64,64,64,64]}
        width={1000}
        height={2000}
        data={data}
        children={children}
    />);

    expect(children).toHaveBeenCalled();
    expect(children.mock.calls[0][0].length).toBe(2);
});


