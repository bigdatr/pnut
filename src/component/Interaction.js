// @flow
import Series from '../series/Series';
import ContinuousScale from '../scale/continuousScale';
import CategoricalScale from '../scale/categoricalScale';

import React, {useEffect, useState, useCallback} from 'react';
import useMousePosition from '@react-hook/mouse-position';
import {bisectRight} from 'd3-array';

type ChildProps<A> = {
    nearestPoint: ?A,
    position: {
        x: number,
        y: number,
        pageX: number,
        pageY: number,
        clientX: number,
        clientY: number,
        screenX: number,
        screenY: number,
        elementWidth: number,
        elementHeight: number,
        isOver: boolean,
        isDown: boolean
    },
    xPoints: Array<{x: number, y: number, point: A}>
};

type Props<A> = {
    scales: {
        series: Series,
        x: ContinuousScale|CategoricalScale,
        y: ContinuousScale|CategoricalScale
    },
    height: number,
    width: number,
    fps?: number,
    onClick?: (ChildProps<A>) => void,
    onChange?: (ChildProps<A>) => void,
    children: (ChildProps<A>) => Node
};
export default function Interaction<A>(props: Props<A>) {
    const [item, setItem] = useState(null);
    const [position, ref] = useMousePosition(0, 0, props.fps || 60);
    const {width, height} = props;
    const {x, y} = props.scales;

    // $FlowFixMe - sucks at defaults
    const {children = () => null} = props;

    useEffect(() => {
        const xValues = x.invert(position.x);
        //const yValues = y.invert(position.y);

        const yValue = y.scale.invert(position.y);
        const yValueArray = xValues.map(y.get);
        const nearestValue = yValueArray.reduce((prev, curr) => Math.abs(curr - yValue) < Math.abs(prev - yValue) ? curr : prev);
        const nearestPoint = xValues.find(point => y.get(point) === nearestValue);

        // use bisect to find the insertion index of the current y value
        // this gives us the stepped value
        const nearestPointStepped = xValues[bisectRight(yValueArray, yValue)];

        const nextValue: ChildProps<A> = {
            position,
            nearestPoint,
            nearestPointStepped,
            xPoints: xValues.map(point => ({
                x: x.scalePoint(point),
                y: y.scalePoint(point),
                point
            }))
        };

        props.onChange && props.onChange(nextValue);
        setItem(nextValue);
    }, [position]);

    const onClick = useCallback(() => {
        props.onClick && item && props.onClick(item);
    }, [item]);

    // $FlowFixMe - I dont even known
    return <g className="Interaction" ref={ref} onClick={onClick}>
        <rect
            x={0}
            y={0}
            width={width}
            height={height}
            stroke='none'
            fill='rgba(0,0,0,0)'
        />
        {item && children(item)}
    </g>;
}
