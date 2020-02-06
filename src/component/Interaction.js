// @flow
import React, {useEffect, useState} from 'react';
import useMousePosition from '@react-hook/mouse-position';
import {bisectRight} from 'd3-array';

type Props<A> = {
    scales: {
        x: ContinuousScale|CategoricalScale,
        y: ContinuousScale|CategoricalScale
    },
    height: number,
    width: number,
    fps?: number,
    children: ({
        nearestRow: A,
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
        items: Array<A>
    }) => Node
};
export default function Interaction<A>(props: Props<A>) {
    const [item, setItem] = useState(null);
    const [position, ref] = useMousePosition(0, 0, props.fps || 60);
    const {width, height} = props;
    const {x, y} = props.scales;
    const {children = () => null} = props;

    useEffect(() => {
        const xValues = x.invert(position.x);
        const yValues = y.invert(position.y);

        const yValue = y.scale.invert(position.y);
        const yValueArray = xValues.map(y.get);
        const nearestValue = yValueArray.reduce((prev, curr) => Math.abs(curr - yValue) < Math.abs(prev - yValue) ? curr : prev);
        const nearestRow = xValues.find(row => y.get(row) === nearestValue);

        // use bisect to find the insertion index of the current y value
        // this gives us the stepped value
        const nearestRowStepped = xValues[bisectRight(yValueArray, yValue)];

        const nextValue = {
            position,
            nearestRow,
            nearestRowStepped,
            items: xValues.map(row => ({
                x: x.scaleRow(row),
                y: y.scaleRow(row),
                row
            }))
        };

        props.onChange && props.onChange(nextValue);
        setItem(nextValue);
    }, [position]);

    //const ref = null;
    return <g className="Interaction" ref={ref}>
        <rect
            x={0}
            y={0}
            width={width}
            height={height}
            stroke='none'
            fill='rgba(0,0,0,0)'
        />
        {item && children(item)}
    </g>
}
