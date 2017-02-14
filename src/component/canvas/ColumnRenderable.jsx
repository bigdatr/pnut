// @flow

import React from 'react';
import type ChartRow from 'src/chartdata/ChartData';

/**
 *
 * @component
 *
 * ColumnRenderable is the basic svg renderer for Column charts. It can render simple column charts and
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
 * return <ColumnRenderable
 *     width={1280}
 *     height={720}
 *     xScale={xScale}
 *     yScale={yScale}
 *     xColumn={'month'}
 *     yColumn={['supply', 'demand']}
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


export class ColumnRenderable extends React.PureComponent {

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
        xColumn: React.PropTypes.string.isRequired,
        /**
         * The column key(s) from `ChartData` to use for the y axis.
         * If multiple column keys are provided then a grouped column chart will be rendered.
         */
        yColumn: React.PropTypes.oneOfType([
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

            const {xScale, yScale, xColumn, yColumn, columnProps} = this.props;
            const rangeY = this.props.yScale.range();

            const yColumnList = [].concat(yColumn);
            const columnPropsList = [].concat(columnProps);
            const columnWidth = xScale.bandwidth() / ((typeof yColumn === 'string') ? 1 : yColumn.length);

            const newColumns = yColumnList.map((
                yColumn: string,
                index: number
            ): React.Element<any> => {
                return <rect
                    key={`${row.get(xColumn)}-${yColumn}`}
                    fill='black'
                    {...columnPropsList[index]}
                    x={xScale(row.get(xColumn)) + columnWidth * index}
                    y={rangeY[1] - yScale(row.get(yColumn))}
                    width={columnWidth}
                    height={yScale(row.get(yColumn))}
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
        return <ColumnRenderable {...this.props} />;
    }
}

