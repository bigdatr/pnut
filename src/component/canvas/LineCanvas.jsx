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
 *
 * @prop {Object} [pathProps]
 * An object of props that will be spread onto the svg `path` element. Any valid
 * [svg path attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) is allowed.
 *
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
    static defaultProps = {
        pathProps: {}
    };

    static propTypes = {
        // Props passed to canvas
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        svgProps: React.PropTypes.object,
        // Own Props
        data: React.PropTypes.object.isRequired,
        scaleX: React.PropTypes.func.isRequired,
        scaleY: React.PropTypes.func.isRequired,
        columnX: React.PropTypes.string.isRequired,
        columnY: React.PropTypes.string.isRequired,
        pathProps: React.PropTypes.object
    };

    buildPath(): string {
        const {data, scaleX, scaleY, columnX, columnY} = this.props;
        return data.rows.map((row: ChartRow, index: number): string => {
            const command = index === 0 ? 'M' : 'L';
            const rangeY = scaleY.range();
            return `${command} ${scaleX(row.get(columnX))} ${rangeY[1] - scaleY(row.get(columnY))}`;
        }).join(' ');
    }

    render(): React.Element<any> {
        return <Canvas {...this.props}>
            <path
                fill='none'
                stroke='black'
                strokeWidth='1'
                {...this.props.pathProps}
                d={this.buildPath()}
            />
        </Canvas>;
    }
}
