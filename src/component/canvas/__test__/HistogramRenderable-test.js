import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {scaleLog, scaleBand} from 'd3-scale';
import Histogram, {HistogramRenderable} from '../HistogramRenderable';
import ChartData from '../../../chartdata/ChartData';

const scaledData = [
    {
        x: 5,
        x0: 5,
        x1: 10,
        y: 10
    },
    {
        x: 10,
        x0: 10,
        x1: 15,
        y: 15
    },
    {
        x: 15,
        x0: 15,
        x1: 20,
        y: 20
    }
];


const HistogramRenderableElement = shallow(<HistogramRenderable
    width={140}
    height={140}
    scaledData={scaledData}
    columnProps={{
        fill: 'blue'
    }}
/>);

test('HistogramRenderable applies passed columnProps to columns', tt => {
    tt.is(HistogramRenderableElement.childAt(0).shallow().prop('fill'), 'blue');
});



test('HistogramRenderable errors out if it doesnt have x0 x1 or y0 y1', tt => {
    const oldConsoleError = console.error;
    const newConsoleError = console.error = sinon.spy();

    const BadHistogramRenderableElement = shallow(<HistogramRenderable
        width={140}
        height={140}
        scaledData={[{x: 0, y: 0}]}
        columnProps={{
            fill: 'blue'
        }}
    />);

    tt.true(newConsoleError.called);
    tt.is(BadHistogramRenderableElement.getNode(), null);

    console.error = oldConsoleError;
});



const HistogramElement = shallow(<Histogram
    width={140}
    height={140}
    scaledData={scaledData}
    columnProps={{
        fill: 'blue'
    }}
/>);

test('Histogram renders a HistogramRenderable', tt => {
    tt.is(HistogramElement.at(0).name(), 'HistogramRenderable');
});



const BarElement = shallow(<Histogram
    width={140}
    height={140}
    scaledData={[
        {
            x: 5,
            y0: 5,
            y1: 10,
            y: 5
        },
        {
            x: 10,
            y0: 10,
            y1: 15,
            y: 10
        }
    ]}
    columnProps={{
        fill: 'blue'
    }}
/>);

test('Histogram can render horizontal charts also', tt => {
    const secondHistogramProps = BarElement.at(0).shallow().childAt(1).prop('columnProps');

    // If this is a bar chart then columnProps x will be 0 for all columns and columnProps y will
    // be greater than 0 for all but the first column
    tt.is(secondHistogramProps.x, 0);
    tt.true(secondHistogramProps.y > 0);
});