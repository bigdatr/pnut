// @flow

import React from 'react';
import Canvas from './Canvas';
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
 * const scaleY = scaleLog()
 *     .domain([0, 10])
 *     .range([0, 720])
 *     .nice();
 *
 * const scaleX = scaleBand()
 *     .domain(['January', 'February', 'March', 'April'])
 *     .range([0, 1280])
 *     .padding(0.1);
 *
 * return <ColumnCanvas
 *     width={1280}
 *     height={720}
 *     scaleX={scaleX}
 *     scaleY={scaleY}
 *     columnX={'month'}
 *     columnY={['supply', 'demand']}
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

export default class ColumnCanvas extends React.PureComponent {

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

        // Own props

        /**
         * {ChartData} The `ChartData` Record used to contain the data for the chart.
         */
        data: React.PropTypes.object.isRequired,
        /**
         * {Scale} A [band scale](https://github.com/d3/d3-scale#band-scales) for the x axis.
         */
        scaleX: React.PropTypes.func.isRequired,
        /**
         * {Scale} A [continuous scale](https://github.com/d3/d3-scale#continuous-scales)
         * for the y axis/axes.
         */
        scaleY: React.PropTypes.func.isRequired,
        /**
         * The column key from `ChartData` to use for the x axis.
         */
        columnX: React.PropTypes.string.isRequired,
        /**
         * The column key(s) from `ChartData` to use for the y axis.
         * If multiple column keys are provided then a grouped column chart will be rendered.
         */
        columnY: React.PropTypes.oneOfType([
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

            const {scaleX, scaleY, columnX, columnY, columnProps} = this.props;
            const rangeY = this.props.scaleY.range();

            const columnYList = [].concat(columnY);
            const columnPropsList = [].concat(columnProps);
            const columnWidth = scaleX.bandwidth() / columnY.length;

            const newColumns = columnYList.map((
                columnY: string,
                index: number
            ): React.Element<any> => {
                return <rect
                    key={`${row.get(columnX)}-${columnY}`}
                    fill='black'
                    {...columnPropsList[index]}
                    x={scaleX(row.get(columnX)) + columnWidth * index}
                    y={rangeY[1] - scaleY(row.get(columnY))}
                    width={columnWidth}
                    height={scaleY(row.get(columnY))}
                />;
            });

            return columns.concat(newColumns);
        }, []);
    }

    render(): React.Element<any> {
        return <Canvas {...this.props}>
            {this.buildColumns()}
        </Canvas>;
    }
}

