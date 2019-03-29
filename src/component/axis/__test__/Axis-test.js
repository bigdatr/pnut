import React from 'react';
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


test('Rendering throws error if bad position is passed', () => {
    const error = jest.fn();
    console.error = error;

    expect(() => {
        shallow(<AxisRenderable
            position={'nottop'}
            scale={scale}
            ticks={scale => scale.ticks(10)}
            width={100}
            height={100}
        />);
    }).toThrowError('unknown position: nottop');

    expect(error).toHaveBeenCalled();
});


test('getTextAnchorProp throws error if bad position is passed', () => {
    expect(() => {
        topAxis.instance().getTextAnchorProp('nottop');
    }).toThrowError('unknown position: nottop');
});

test('getAlignmentBaselineProp throws error if bad position is passed', () => {
    expect(() => {
        topAxis.instance().getAlignmentBaselineProp('nottop');
    }).toThrowError('unknown position: nottop');
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





test('getAlignmentBaselineProp returns a valid value for top position', () => {
    expect(
        validDominantBaselineValues.indexOf(topAxis.instance().getAlignmentBaselineProp('top')) !== -1
    ).toBe(true);
});

test('getAlignmentBaselineProp returns a valid value for right position', () => {
     expect(
         validDominantBaselineValues.indexOf(topAxis.instance().getAlignmentBaselineProp('right')) !== -1
     ).toBe(true);
});

test('getAlignmentBaselineProp returns a valid value for bottom position', () => {
     expect(
         validDominantBaselineValues.indexOf(topAxis.instance().getAlignmentBaselineProp('bottom')) !== -1
     ).toBe(true);
});

test('getAlignmentBaselineProp returns a valid value for left position', () => {
     expect(
         validDominantBaselineValues.indexOf(topAxis.instance().getAlignmentBaselineProp('left')) !== -1
     ).toBe(true);
});




const validTextAnchorValues = ['start', 'middle', 'end', 'inherit'];

test('getTextAnchorProp returns a valid value for top position', () => {
     expect(
         validTextAnchorValues.indexOf(topAxis.instance().getTextAnchorProp('top')) !== -1
     ).toBe(true);
});

test('getTextAnchorProp returns a valid value for right position', () => {
     expect(
         validTextAnchorValues.indexOf(topAxis.instance().getTextAnchorProp('right')) !== -1
     ).toBe(true);
});

test('getTextAnchorProp returns a valid value for bottom position', () => {
     expect(
         validTextAnchorValues.indexOf(topAxis.instance().getTextAnchorProp('bottom')) !== -1
     ).toBe(true);
});

test('getTextAnchorProp returns a valid value for left position', () => {
     expect(
         validTextAnchorValues.indexOf(topAxis.instance().getTextAnchorProp('left')) !== -1
     ).toBe(true);
});


//
// positions

test('getPointPosition returns corrent [x,y] values for top position', () => {
    expect(topAxis.instance().getPointPosition('top', 50, 5)).toEqual([50, -5]);
});

test('getPointPosition returns corrent [x,y] values for right position', () => {
    expect(topAxis.instance().getPointPosition('right', 50, 5)).toEqual([105, 50]);
});

test('getPointPosition returns corrent [x,y] values for bottom position', () => {
    expect(topAxis.instance().getPointPosition('bottom', 50, 5)).toEqual([50, 105]);
});

test('getPointPosition returns corrent [x,y] values for left position', () => {
    expect(topAxis.instance().getPointPosition('left', 50, 5)).toEqual([-5, 50]);
});

test('a location prop will override the point postion default and use the opposite scale value', () => {
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

    expect(axis.instance().getPointPosition('top', 50, 5)).toEqual([50, 35]);
    expect(axis.instance().getPointPosition('left', 50, 5)).toEqual([35, 50]);
});



test('getLengthProp returns "width" for top or bottom', () => {
    expect(topAxis.instance().getLengthProp('top')).toBe('width');
    expect(topAxis.instance().getLengthProp('bottom')).toBe('width');
});

test('getLengthProp returns "height" for left or right', () => {
    expect(topAxis.instance().getLengthProp('left')).toBe('height');
    expect(topAxis.instance().getLengthProp('right')).toBe('height');
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


test('Axis places ticks in middle of bandwidth', () => {
    expect(scaleBandAxis.childAt(1).childAt(0).childAt(0).shallow().prop('x1')).toBe(width / 4);
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


test('Axis allows custom tick props', () => {
    expect(scaleBandAxis.childAt(1).childAt(0).childAt(0).shallow().prop('stroke')).toBe('inherit');
    expect(
        axisWithCustomTicks.childAt(1).childAt(0).childAt(0).shallow().prop('stroke')
    ).toBe('red');
    expect(
        axisWithCustomTicks.childAt(1).childAt(1).childAt(0).shallow().prop('stroke')
    ).toBe('blue');
});

test('Axis allows custom text props', () => {
    expect(scaleBandAxis.childAt(1).childAt(0).childAt(1).shallow().prop('fontSize')).toBe(12);
    expect(
        axisWithCustomTicks.childAt(1).childAt(0).childAt(1).shallow().prop('color')
    ).toBe('red');
    expect(
        axisWithCustomTicks.childAt(1).childAt(1).childAt(1).shallow().prop('color')
    ).toBe('blue');
});


test('Axis allows custom axisLine props', () => {
    const getAxisStroke = (scale) => scale
        .childAt(0)
        .childAt(0)
        .shallow()
        .prop('stroke');
    expect(getAxisStroke(scaleBandAxis)).toBe('inherit');
    expect(getAxisStroke(axisWithCustomTicks)).toBe('red');
});



test('Axis with discrete scales will use domain for ticks. Other will use ticks', () => {
    const linear = scaleLinear()
        .domain([0, 100])
        .range([0, 200]);

    const band = scaleBand()
        .domain(['category1', 'category2'])
        .range([0, width]);

    const linearAxis = shallow(<AxisRenderable position="top" scale={linear} width={100} height={100} />);
    const bandAxis = shallow(<AxisRenderable position="top" scale={band} width={100} height={100} />);

    expect(linearAxis.childAt(1).children().length).toBe(11);
    expect(bandAxis.childAt(1).children().length).toBe(2);

});

test('Axis renders a AxisRenderable', () => {
    const canvas = shallow(<Axis data={{}} scale={() => undefined} />);
    expect(canvas.name()).toBe('AxisRenderable');
});

test('Axis with an x dimension defaults position to bottom', () => {
    const x = shallow(<Axis dimension="x" data={{}} scale={() => undefined} />);
    const other = shallow(<Axis data={{}} scale={() => undefined} />);
    expect(x.prop('position')).toBe('bottom');
    expect(other.prop('position')).toBe('left');
});


test('Axis with a time scale will default text to YYYY-MM-DD', () => {
    const rows = [
        {foo: new Date('1970-01-01')},
        {foo: new Date('1970-01-02')},
        {foo: new Date('1970-01-03')}
    ];

    const canvas = shallow(<AxisRenderable
        scale={scaleTime().domain([rows[0].foo, rows[2].foo])}
        position="top"
    />);
    expect(canvas.childAt(1).childAt(0).childAt(1).shallow().text()).toBe('1970-01-01');
});

test('Axis Renderable will default position to x:bottom and y:left', () => {
    const rows = [
        {foo: new Date('1970-01-01')},
        {foo: new Date('1970-01-02')},
        {foo: new Date('1970-01-03')}
    ];

    expect(shallow(<Axis dimension="x"/>).props().position).toBe('bottom');
    expect(shallow(<Axis dimension="y"/>).props().position).toBe('left');
    expect(shallow(<Axis dimension="x" position="top"/>).props().position).toBe('top');
});
