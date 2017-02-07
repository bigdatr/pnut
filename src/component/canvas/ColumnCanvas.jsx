// @flow

import React from 'react';
import type ChartRow from 'src/chartdata/ChartData';

/**
 *
 * @component
 *
 * ColumnCanvas is the basic svg renderer for Column charts. It can render simple column charts and
 * grouped column charts.
 *
 * @example
 *
 * const yScale = scaleLog()
 *     .domain([0, 10])
 *     .range([0, 720])
 *     .nice();
 *
 * const xScale = scaleBand()
 *     .domain(['January', 'February', 'March', 'April'])
 *     .range([0, 1280])
 *     .padding(0.1);
 *
 * return <ColumnCanvas
 *     width={1280}
 *     height={720}
 *     xScale={xScale}
 *     yScale={yScale}
 *     xDimension={'month'}
 *     yDimension={['supply', 'demand']}
 *     data={chartData}
 *     columnProps={[
 *         {
 *             fill: 'blue'
 *         },
 *         {
 *             fill: 'red'
 *         }
 *     ]}
 * />;
 *
 *
 */


export class ColumnCanvas extends React.PureComponent {

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


        /**
         * {ChartData} The `ChartData` Record used to contain the data for the chart.
         */
        data: React.PropTypes.object.isRequired,
        /**
         * {Scale} A [band scale](https://github.com/d3/d3-scale#band-scales) for the x axis.
         */
        xScale: React.PropTypes.func.isRequired,
        /**
         * {Scale} A [continuous scale](https://github.com/d3/d3-scale#continuous-scales)
         * for the y axis/axes.
         */
        yScale: React.PropTypes.func.isRequired,
        /**
         * The column key from `ChartData` to use for the x axis.
         */
        xDimension: React.PropTypes.string.isRequired,
        /**
         * The column key(s) from `ChartData` to use for the y axis.
         * If multiple column keys are provided then a grouped column chart will be rendered.
         */
        yDimension: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.arrayOf(React.PropTypes.string)
        ]).isRequired,
        /**
         * One or more prop objects that are to be passed to the svg
         * [`rect`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect) element.
         * Any valid svg `rect` props are allowed.
         * If an array of objects is passed here then it should be the same length
         * as the columnY array.
         */
        columnProps: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.arrayOf(React.PropTypes.object)
        ])
    };

    static defaultProps = {
        columnProps: []
    };

    buildColumns(): Array<React.Element<any>> {
        return this.props.data.rows.reduce((
            columns: Array<React.Element<any>>,
            row: ChartRow
        ): Array<React.Element<any>> => {

            const {xScale, yScale, xDimension, yDimension, columnProps} = this.props;
            const rangeY = this.props.yScale.range();

            const yDimensionList = [].concat(yDimension);
            const columnPropsList = [].concat(columnProps);
            const columnWidth = xScale.bandwidth() / ((typeof yDimension === 'string') ? 1 : yDimension.length);

            const newColumns = yDimensionList.map((
                yDimension: string,
                index: number
            ): React.Element<any> => {
                return <rect
                    key={`${row.get(xDimension)}-${yDimension}`}
                    fill='black'
                    {...columnPropsList[index]}
                    x={xScale(row.get(xDimension)) + columnWidth * index}
                    y={rangeY[1] - yScale(row.get(yDimension))}
                    width={columnWidth}
                    height={yScale(row.get(yDimension))}
                />;
            });

            return columns.concat(newColumns);
        }, []);
    }

    render(): React.Element<any> {
        return <g>
            {this.buildColumns()}
        </g>;
    }
}

export default class Column extends React.Component {
    static chartType = 'canvas';
    render(): React.Element<any> {
        return <ColumnCanvas {...this.props} />;
    }
}

