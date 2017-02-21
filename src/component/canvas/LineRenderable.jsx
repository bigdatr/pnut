// @flow

import React, {PropTypes} from 'react';
import type List from 'immutable';
import ChartData from '../../chartdata/ChartData';
import * as d3Shape from 'd3-shape';

import type ChartRow from 'src/chartdata/ChartData';

function DefaultLine(props: Object): React.Element<any> {
    return <path
        {...props.lineProps}
    />;
}

DefaultLine.propTypes = {
    /** Scaled xy points in array form */
    points: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),

    /** An object containing the minimum data required to draw an svg path */
    lineProps: PropTypes.shape({

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
 *     lineProps={{
 *          strokeWidth: '2'
 *     }}
 *     line={(props) => <path {...props.lineProps} stroke="red"/>}
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
        lineProps: React.PropTypes.object
    };

    lineGenerator = d3Shape.line()
        .x((ii) => ii.x)
        .y((ii) => ii.y)
        .defined(ii => typeof ii.x === 'number' &&
                       typeof ii.y === 'number' &&
                       !isNaN(ii.x) &&
                       !isNaN(ii.y)
        );

    areaGenerator = d3Shape.area()
        .x((ii) => ii.x)
        .y1((ii) => ii.y)
        .y0((ii) => this.props.height)
        .defined(ii => typeof ii.x === 'number' &&
                       typeof ii.y === 'number' &&
                       !isNaN(ii.x) &&
                       !isNaN(ii.y)
        );


    render(): React.Element<any> {
        const {
            data,
            line: Line
        } = this.props;

        const curve = this.props.curve
            ? this.props.curve(d3Shape)
            : d3Shape.curveLinear;

        const pathGenerator = this.props.area
            ? this.areaGenerator.curve(curve)
            : this.lineGenerator.curve(curve);

        return <g>
            <Line
                pathGenerator={pathGenerator}
                data={this.props.data}
                scaledData={this.props.scaledData}
                lineProps={{
                    fill: this.props.area ? 'black' : 'none',
                    stroke: this.props.area ? 'none' : 'black',
                    d: pathGenerator(this.props.scaledData),
                    ...this.props.lineProps
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

