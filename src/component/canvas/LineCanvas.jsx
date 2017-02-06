// @flow

import React from 'react';
import Canvas from './Canvas';
import type ChartRow from 'src/chartdata/ChartData';

/**
 *
 * @component
 *
 * LineCanvas is the basic svg renderer for Line charts.
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
 * return <LineCanvas
 *     width={1280}
 *     height={720}
 *     scaleX={scaleX}
 *     scaleY={scaleY}
 *     columnX={'month'}
 *     columnY={'demand'}
 *     data={chartData}
 *     pathProps={{
 *         strokeWidth: '2'
 *     }}
 * />;
 *
 *
 */

export default class LineCanvas extends React.PureComponent {
    static chartType = 'plane2d';

    static defaultProps = {
        pathProps: {}
    };

    static propTypes = {
        // Props passed to canvas

        /**
         * The width of the canvas. This is just passed on to the Canvas component.
         */
        height: React.PropTypes.number,
        /**
         * The height of the canvas. This is just passed on to the Canvas component.
         */
        width: React.PropTypes.number,
        /**
         * An object of props that will be spread onto the svg element.
         * This is just passed on to the Canvas component.
         */
        svgProps: React.PropTypes.object,

        // Own Props

        /**
         * {ChartData} The `ChartData` Record used to contain the data for the chart.
         */
        data: React.PropTypes.object.isRequired,
        /**
         * {Scale} Any d3-scale for the x axis.
         */
        scaleX: React.PropTypes.func.isRequired,
        /**
         * {Scale} Any d3-scale for the y axis.
         */
        scaleY: React.PropTypes.func.isRequired,
        /**
         * The column key from `ChartData` to use for the x axis.
         */
        columnX: React.PropTypes.string.isRequired,
        /**
         * The column key from `ChartData` to use for the y axis.
         */
        columnY: React.PropTypes.string.isRequired,
        /**
         * An object of props that will be spread onto the svg `path` element. Any valid
         * [svg path attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path)
         * is allowed.
         */
        pathProps: React.PropTypes.object
    };

    buildPath(): string {
        const {data, scaleX, scaleY, columnX, columnY} = this.props;
        return data.rows.map((row: ChartRow, index: number): string => {
            const command = index === 0 || !data.rows.get(index - 1) ? 'M' : 'L';
            const rangeY = scaleY.range();
            return `${command} ${scaleX(row.get(columnX))} ${rangeY[1] - scaleY(row.get(columnY))}`;
        }).join(' ');
    }

    render(): React.Element<any> {
        return <path
                fill='none'
                stroke='black'
                strokeWidth='1'
                {...this.props.pathProps}
                d={this.buildPath()}
            />;
        // return <Canvas {...this.props}>
        //     <path
        //         fill='none'
        //         stroke='black'
        //         strokeWidth='1'
        //         {...this.props.pathProps}
        //         d={this.buildPath()}
        //     />
        // </Canvas>;
    }
}
