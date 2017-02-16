// @flow

import React, {PropTypes} from 'react';
import type List from 'immutable';
import ChartData from '../../chartdata/ChartData';

import type ChartRow from 'src/chartdata/ChartData';


function DefaultLine(props: Object): React.Element<any> {
    return <path
        fill='none'
        stroke='black'
        strokeWidth='1'
        {...props.pathProps}
    />;
}

DefaultLine.propTypes = {
    /** Scaled xy points in array form */
    points: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),

    /** An object containing the minimum data required to draw an svg path */
    pathProps: PropTypes.shape({

        /** Calculated d string */
        d: PropTypes.string
    })
};

/**
 *
 * @component
 *
 * LineRenderable is the basic svg renderer for Line charts.
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
 * return <LineRenderable
 *     width={1280}
 *     height={720}
 *     xScale={xScale}
 *     yScale={yScale}
 *     xColumn={'month'}
 *     yColumn={'demand'}
 *     data={chartData}
 *     pathProps={{
 *          strokeWidth: '2'
 *     }}
 *     line={(props) => <path {...props.pathProps} stroke="red"/>}
 * />;
 *
 */

export class LineRenderable extends React.PureComponent {
    static defaultProps = {
        line: DefaultLine
    };

    static propTypes = {
        /** {ChartData} The `ChartData` Record used to contain the data for the chart. */
        data: React.PropTypes.object.isRequired,

        /** custom line renderer */
        line: React.PropTypes.func,

        /** Destructured onto the default line renderer's path. */
        pathProps: React.PropTypes.object,

        /** {Scale} Any d3-scale for the x axis. */
        xScale: React.PropTypes.func.isRequired,

        /** {Scale} Any d3-scale for the y axis. */
        yScale: React.PropTypes.func.isRequired,

        /** The column key from `ChartData` to use for the x axis. */
        xColumn: React.PropTypes.string.isRequired,

        /** The column key from `ChartData` to use for the y axis. */
        yColumn: React.PropTypes.string.isRequired

    };

    buildPoints(data: ChartData): List<number[]> {
        const {xScale, yScale, xColumn, yColumn} = this.props;

        return data.rows
            .map((row: ChartRow): number[] => {
                const rangeY = yScale.range();
                const offset = xScale.bandwidth ? xScale.bandwidth() / 2 : 0;
                return [
                    xScale(row.get(xColumn)) + offset,
                    rangeY[1] - yScale(row.get(yColumn))
                ];
            });
    }

    buildPath(points: List<number[]>): string {
        return points
            .map((coordinate: number[], index: number): string => {
                const [x, y] = coordinate;
                const command = index === 0 || !this.props.data.rows.get(index - 1) ? 'M' : 'L';
                return `${command} ${x} ${y}`;
            })
            .join(' ');
    }

    render(): React.Element<any> {
        const {
            data,
            line: Line
        } = this.props;

        const points = this.buildPoints(data);

        return <g>
            <Line
                points={points.toArray()}
                pathProps={{
                    d: this.buildPath(points),
                    ...this.props.pathProps
                }}
            />
        </g>;
    }
}

export default class Line extends React.Component {
    static chartType = 'canvas';
    render(): React.Element<any> {
        return <LineRenderable {...this.props} />;
    }
}

