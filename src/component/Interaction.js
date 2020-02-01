// @flow
import React, {useEffect, useState} from 'react';
import useMousePosition from '@react-hook/mouse-position';

type Props = {
    scales: {
        x: ContinuousScale|CategoricalScale,
        y: ContinuousScale|CategoricalScale
    },
    height: number,
    width: number
};
export default function Interaction(props: Props) {
    const [items, setItems] = useState([]);
    const [position, ref] = useMousePosition(0, 0, 5);
    const {width, height} = props;
    const {x, y, series} = props.scales;

    useEffect(() => {
        const xValue = x.invert(position.x);
        const possibleY = series.data.filter(ii => x.get(ii).getTime() === x.get(xValue).getTime());
        const yValue = y.invert(position.y, possibleY);
        console.log(yValue);
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
    </g>
}
