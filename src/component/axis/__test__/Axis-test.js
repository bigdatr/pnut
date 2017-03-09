import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Axis,{AxisRenderable} from '../Axis';
import ChartData from '../../../chartdata/ChartData';
import {scaleLinear, scaleBand, scaleTime} from 'd3-scale';

const savedErrorLog = console.error;

const scale = scaleLinear()
    .domain([0,100])
    .range([0,200]);

const topAxis = shallow(<AxisRenderable
    position={'top'}
    scale={scale}
    ticks={scale => scale.ticks(10)}
    width={100}
    height={100}
/>);


test('Rendering throws error if bad position is passed', tt => {
    const error = sinon.spy();
    console.error = error;

    tt.throws(() => {
        shallow(<AxisRenderable
            position={'nottop'}
            scale={scale}
            ticks={scale => scale.ticks(10)}
            width={100}
            height={100}
        />);
    }, 'unknown position: nottop');

    tt.true(error.called);
});


test('getTextAnchorProp throws error if bad position is passed', tt => {
    tt.throws(() => {
        topAxis.instance().getTextAnchorProp('nottop');
    }, 'unknown position: nottop');
});

test('getAlignmentBaselineProp throws error if bad position is passed', tt => {
    tt.throws(() => {
        topAxis.instance().getAlignmentBaselineProp('nottop');
    }, 'unknown position: nottop');
});


const validDominantBaselineValues = [
    'auto',
    'use-script',
    'no-change',
    'reset-size',
    'ideographic',
    'alphabetic',
    'hanging',
    'mathematical',
    'central',
    'middle',
    'text-after-edge',
    'text-before-edge',
    'inherit'
];





test('getAlignmentBaselineProp returns a valid value for top position', tt => {
    tt.true(validDominantBaselineValues.indexOf(topAxis.instance().getAlignmentBaselineProp('top')) !== -1);
});

test('getAlignmentBaselineProp returns a valid value for right position', tt => {
     tt.true(validDominantBaselineValues.indexOf(topAxis.instance().getAlignmentBaselineProp('right')) !== -1);
});

test('getAlignmentBaselineProp returns a valid value for bottom position', tt => {
     tt.true(validDominantBaselineValues.indexOf(topAxis.instance().getAlignmentBaselineProp('bottom')) !== -1);
});

test('getAlignmentBaselineProp returns a valid value for left position', tt => {
     tt.true(validDominantBaselineValues.indexOf(topAxis.instance().getAlignmentBaselineProp('left')) !== -1);
});




const validTextAnchorValues = ['start', 'middle', 'end', 'inherit'];

test('getTextAnchorProp returns a valid value for top position', tt => {
     tt.true(validTextAnchorValues.indexOf(topAxis.instance().getTextAnchorProp('top')) !== -1);
});

test('getTextAnchorProp returns a valid value for right position', tt => {
     tt.true(validTextAnchorValues.indexOf(topAxis.instance().getTextAnchorProp('right')) !== -1);
});

test('getTextAnchorProp returns a valid value for bottom position', tt => {
     tt.true(validTextAnchorValues.indexOf(topAxis.instance().getTextAnchorProp('bottom')) !== -1);
});

test('getTextAnchorProp returns a valid value for left position', tt => {
     tt.true(validTextAnchorValues.indexOf(topAxis.instance().getTextAnchorProp('left')) !== -1);
});


//
// positions

test('getPointPosition returns corrent [x,y] values for top position', tt => {
    tt.deepEqual(topAxis.instance().getPointPosition('top', 50, 5), [50, -5]);
});

test('getPointPosition returns corrent [x,y] values for right position', tt => {
    tt.deepEqual(topAxis.instance().getPointPosition('right', 50, 5), [105, 50]);
});

test('getPointPosition returns corrent [x,y] values for bottom position', tt => {
    tt.deepEqual(topAxis.instance().getPointPosition('bottom', 50, 5), [50, 105]);
});

test('getPointPosition returns corrent [x,y] values for left position', tt => {
    tt.deepEqual(topAxis.instance().getPointPosition('left', 50, 5), [-5, 50]);
});

test('a location prop will override the point postion default and use the opposite scale value', tt => {
    const axis = shallow(<AxisRenderable
        position="top"
        xScale={scale}
        yScale={scale}
        scale={scale}
        ticks={scale => scale.ticks(10)}
        width={100}
        height={100}
        location={20}
    />);

    tt.deepEqual(axis.instance().getPointPosition('top', 50, 5), [50, 35]);
    tt.deepEqual(axis.instance().getPointPosition('left', 50, 5), [35, 50]);
});



test('getLengthProp returns "width" for top or bottom', tt => {
    tt.is(topAxis.instance().getLengthProp('top'), 'width');
    tt.is(topAxis.instance().getLengthProp('bottom'), 'width');
});

test('getLengthProp returns "height" for left or right', tt => {
    tt.is(topAxis.instance().getLengthProp('left'), 'height');
    tt.is(topAxis.instance().getLengthProp('right'), 'height');
});


const width = 100;

const scaleBandScale = scaleBand()
    .domain(['category1', 'category2'])
    .range([0,width]);

const scaleBandAxis = shallow(<AxisRenderable
    position={'bottom'}
    scale={scaleBandScale}
    ticks={() => ['category1', 'category2']}
    width={width}
    height={100}
/>);


test('Axis places ticks in middle of bandwidth', tt => {
    tt.is(scaleBandAxis.childAt(1).childAt(0).childAt(0).shallow().prop('x1'), width / 4);
});

const customTick = (props) => <line {...props.tickLineProps} stroke={props.index === 0 ? 'red': 'blue'} />;
const customAxisLine = (props) => <line {...props.axisLineProps} stroke="red" />;
const customText = (props) => <text {...props.textProps} color={props.index === 0 ? 'red': 'blue'} />;


const axisWithCustomTicks = shallow(<AxisRenderable
    position={'bottom'}
    scale={scaleBandScale}
    ticks={() => ['category1', 'category2']}
    tickLine={customTick}
    text={customText}
    axisLine={customAxisLine}
    width={width}
    height={100}
/>);


test('Axis allows custom tick props', tt => {
    tt.is(scaleBandAxis.childAt(1).childAt(0).childAt(0).shallow().prop('stroke'), 'inherit');
    tt.is(axisWithCustomTicks.childAt(1).childAt(0).childAt(0).shallow().prop('stroke'), 'red');
    tt.is(axisWithCustomTicks.childAt(1).childAt(1).childAt(0).shallow().prop('stroke'), 'blue');
});

test('Axis allows custom text props', tt => {
    tt.is(scaleBandAxis.childAt(1).childAt(0).childAt(1).shallow().prop('fontSize'), 12);
    tt.is(axisWithCustomTicks.childAt(1).childAt(0).childAt(1).shallow().prop('color'), 'red');
    tt.is(axisWithCustomTicks.childAt(1).childAt(1).childAt(1).shallow().prop('color'), 'blue');
});


test('Axis allows custom axisLine props', tt => {
    const getAxisStroke = (scale) => scale
        .childAt(0)
        .childAt(0)
        .shallow()
        .prop('stroke');
    tt.is(getAxisStroke(scaleBandAxis), 'inherit');
    tt.is(getAxisStroke(axisWithCustomTicks), 'red');
});



test('Axis with discrete scales will use domain for ticks. Other will use ticks', tt => {
    const linear = scaleLinear()
        .domain([0, 100])
        .range([0, 200]);

    const band = scaleBand()
        .domain(['category1', 'category2'])
        .range([0, width]);

    const linearAxis = shallow(<AxisRenderable position="top" scale={linear} width={100} height={100} />);
    const bandAxis = shallow(<AxisRenderable position="top" scale={band} width={100} height={100} />);

    tt.is(linearAxis.childAt(1).children().length, 11);
    tt.is(bandAxis.childAt(1).children().length, 2);

});

test('Axis renders a AxisRenderable', tt => {
    const canvas = shallow(<Axis data={{}} scale={() => undefined} />);
    tt.is(canvas.name(), 'AxisRenderable');
});


test('Axis with a time scale will default text to YYYY-MM-DD', tt => {
    const rows = [
        {foo: new Date('1970-01-01')},
        {foo: new Date('1970-01-02')},
        {foo: new Date('1970-01-03')}
    ];

    const canvas = shallow(<AxisRenderable
        scale={scaleTime().domain([rows[0].foo, rows[2].foo])}
        position="top"
    />);
    tt.is(canvas.childAt(1).childAt(0).childAt(1).shallow().text(), '1970-01-01');
});

test('Axis Renderable will default position to x:bottom and y:left', tt => {
    const rows = [
        {foo: new Date('1970-01-01')},
        {foo: new Date('1970-01-02')},
        {foo: new Date('1970-01-03')}
    ];

    tt.is(shallow(<Axis dimension="x"/>).props().position, 'bottom');
    tt.is(shallow(<Axis dimension="y"/>).props().position, 'left');
    tt.is(shallow(<Axis dimension="x" position="top"/>).props().position, 'top');
});





