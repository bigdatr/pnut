// @flow

import React from 'react';
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
 * @prop {ChartScalar} dataX - The `ChartScalar` value for `xColumn` in this row.
 * @prop {ChartScalar} dataY - The `ChartScalar` value for `yColumn` in this row.
 * @prop {ChartRow} row - The `ChartRow` corresponding to this dot.
 */

const defaultDot = (props: DotProps): React.Element<any> => {
    return <circle fill='black' r={3} {...props.dotProps}/>;
};


/**
 *
 * @component
 *
 * ScatterRenderable is the basic svg renderer for Scatter charts.
 *
 * @example
 *
 * const yScale = scaleLog()
 *     .domain([0, 10])
 *     .range([0, 720])
 *     .nice();
 *
 * const xScale = scalePoint()
 *     .domain(['January', 'February', 'March', 'April'])
 *     .range([0, 1280]);
 *
 * const scaleRadius = scaleLinear()
 *     .domain([0, 100])
 *     .range([5, 30]);
 *
 * return <ScatterRenderable
 *     width={1280}
 *     height={720}
 *     xScale={xScale}
 *     yScale={yScale}
 *     xColumn={'month'}
 *     yColumn={'demand'}
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

export class ScatterRenderable extends React.PureComponent {
    static defaultProps = {
        dot: defaultDot
    };

    static propTypes = {
        // Props passed to canvas

        /**
         * The width of the canvas. This is just passed on to the Svg component.
         */
        height: React.PropTypes.number,
        /**
         * The height of the canvas. This is just passed on to the Svg component.
         */
        width: React.PropTypes.number,
        /**
         * An object of props that will be spread onto the svg element.
         * This is just passed on to the Svg component.
         */
        svgProps: React.PropTypes.object,

        // Own props

        /**
         * {ChartData} The `ChartData` Record used to contain the data for the chart.
         */
        data: React.PropTypes.object.isRequired,
        /**
         * {Scale} Any d3-scale for the x axis.
         */
        xScale: React.PropTypes.func.isRequired,
        /**
         * {Scale} Any d3-scale for the y axis.
         */
        yScale: React.PropTypes.func.isRequired,
        /**
         * The column key from `ChartData` to use for the x axis.
         */
        xColumn: React.PropTypes.string.isRequired,
        /**
         * The column key from `ChartData` to use for the y axis.
         */
        yColumn: React.PropTypes.string.isRequired,
        /**
         * {Dot} An optional react component that will be used to render dots on the chart.
         * Defaults to rendering a `<circle/>`.
         */
        dot: React.PropTypes.func
    };

    buildDot(row, index) {
        const {dot: Dot, dotProps} = this.props;
        return <Dot
            key={index}
            dotProps={{
                cx: row.x,
                cy: row.y,
                ...dotProps
            }}
            dimensions={row}
            index={index}
            data={this.props.data}
            scaledData={this.props.scaledData}
        />
    }

    render(): React.Element<any> {
        const {scaledData} = this.props;

        return <g>
            {scaledData.map((row, index) => {
                return this.buildDot(row, index);
            })}
        </g>;
    }
}

export default class Scatter extends React.Component {
    static chartType = 'canvas';
    render(): React.Element<any> {
        return <ScatterRenderable {...this.props} />;
    }
}
