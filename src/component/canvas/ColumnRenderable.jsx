// @flow

import React from 'react';
import type ChartRow from 'src/chartdata/ChartData';


function DefaultColumn(props: Object): React.Element<any> {
    return <rect
        fill='black'
        {...props.rectProps}
    />;
}


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
        yColumn: React.PropTypes.string.isRequired,
        /**
         * One or more prop objects that are to be passed to the svg
         * [`rect`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect) element.
         * Any valid svg `rect` props are allowed.
         * If an array of objects is passed here then it should be the same length
         * as the columnY array.
         */
        columnProps: React.PropTypes.object,

    };

    static defaultProps = {
        columnProps: {},
        column: DefaultColumn

    };

    buildColumn(row, orientation, bandwidth, index) {
        const {column: Column} = this.props;

        let x, y, width, height;

        if(orientation === 'vertical') {
            x = row.x - bandwidth / 2;
            y = row.y;
            width = bandwidth;
            height = this.props.height - row.y;
        } else {
            x = 0;
            y = row.y - bandwidth / 2;
            width = row.x;
            height = bandwidth;
        }

        return <Column
            key={
                orientation === 'vertical'
                    ? this.props.xScale.domain()[index]
                    : this.props.yScale.domain()[index]
            }
            rectProps={{
                x, y, width, height,
                ...this.props.rectProps
            }}
            dimensions={row}
            index={index}
            data={this.props.data}
            scaledData={this.props.scaledData}
        />
    }

    render(): React.Element<any> {

        const {xScale, yScale, columnProps} = this.props;
        const orientation = this.props.orientation || xScale.bandwidth
            ? 'vertical'
            :  yScale.bandwidth
                ? 'horizontal'
                : console.error('Column chart must have at least one band scale');

        if(!orientation) return null;

        const bandwidth = orientation === 'vertical' ? xScale.bandwidth() : yScale.bandwidth();

        return <g>
            {this.props.scaledData.map(
                (row, index) => this.buildColumn(row, orientation, bandwidth, index)
            )}
        </g>;
    }
}

export default class Column extends React.Component {
    static chartType = 'canvas';
    render(): React.Element<any> {
        return <ColumnRenderable {...this.props} />;
    }
}

