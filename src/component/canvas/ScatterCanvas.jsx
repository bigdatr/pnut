// @flow

import React from 'react';
import Canvas from './Canvas';
import type {ChartScalar, ChartRow} from 'src/chartdata/ChartData';

type DotProps = {
    key: string,
    x: number,
    y: number,
    dataX: ChartScalar,
    dataY: ChartScalar,
    row: ChartRow
};

/**
 *
 * @typedef Dot
 * @type ReactElement
 *
 * @prop {number} x - The x position of the dot on the canvas
 * @prop {number} y - The y position of the dot on the canvas
 * @prop {ChartScalar} dataX - The `ChartScalar` value for `columnX` in this row.
 * @prop {ChartScalar} dataY - The `ChartScalar` value for `columnY` in this row.
 * @prop {ChartRow} row - The `ChartRow` corresponding to this dot.
 */

const defaultDot = (dotProps: DotProps): React.Element<any> => {
    const {x, y} = dotProps;
    return <circle fill='black' cx={x} cy={y} r={3}/>;
};


/**
 *
 * @component
 *
 * ScatterCanvas is the basic svg renderer for Scatter charts.
 *
 * @prop {number} [height]
 * The width of the canvas. This is just passed on to the Canvas component.
 *
 * @prop {number} [width]
 * The height of the canvas. This is just passed on to the Canvas component.
 *
 * @prop {Object} [svgProps]
 * An object of props that will be spread onto the svg element. This is just passed on to the
 * Canvas component.
 *
 * @prop {ChartData} data
 * The `ChartData` Record used to contain the data for the chart.
 *
 * @prop {Scale} scaleX
 * Any d3-scale for the x axis
 *
 * @prop {Scale} scaleY
 * Any d3-scale for the y axis
 *
 * @prop {string} columnX
 * The column key from `ChartData` to use for the x axis
 *
 * @prop {string} columnY
 * The column key from `ChartData` to use for the y axis
 *
 * @prop {Dot} [dot]
 * An optional react element that will be used to render dots on the chart. Defaults to a `<circle/>`
 *
 * @example
 *
 * const scaleY = scaleLog()
 *     .domain([0, 10])
 *     .range([0, 720])
 *     .nice();
 *
 * const scaleX = scalePoint()
 *     .domain(['January', 'February', 'March', 'April'])
 *     .range([0, 1280]);
 *
 * const scaleRadius = scaleLinear()
 *     .domain([0, 100])
 *     .range([5, 30]);
 *
 * return <ScatterCanvas
 *     width={1280}
 *     height={720}
 *     scaleX={scaleX}
 *     scaleY={scaleY}
 *     columnX={'month'}
 *     columnY={'demand'}
 *     data={chartData}
 *     dot={({x, y, dataX, dataY, row}) => <circle
 *         cx={x}
 *         cy={y}
 *         r={scaleRadius(row.get('demand'))}
 *     />}
 * />;
 *
 *
 */

export default class ScatterCanvas extends React.PureComponent {

    static defaultProps = {
        dot: defaultDot
    };

    static propTypes = {
        // Props passed to canvas
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        svgProps: React.PropTypes.object,
        // Own props
        data: React.PropTypes.object.isRequired,
        scaleX: React.PropTypes.func.isRequired,
        scaleY: React.PropTypes.func.isRequired,
        columnX: React.PropTypes.string.isRequired,
        columnY: React.PropTypes.string.isRequired,
        dot: React.PropTypes.func
    };

    buildDots(): Array<React.Element<any>> {
        const {data, scaleX, scaleY, columnX, columnY, dot} = this.props;
        const Dot = dot;
        const rangeY = scaleY.range();

        return data.rows.map((row: ChartRow, index: number): React.Element<any> => {
            const dataX = row.get(columnX);
            const dataY = row.get(columnY);
            return <Dot
                key={index}
                x={scaleX(dataX)}
                y={rangeY[1] - scaleY(dataY)}
                dataX={dataX}
                dataY={dataY}
                row={row}
            />;
        });
    }

    render(): React.Element<any> {
        return <Canvas {...this.props}>
            {this.buildDots()}
        </Canvas>;
    }
}
