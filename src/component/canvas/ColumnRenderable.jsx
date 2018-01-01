// @flow

import PropTypes from 'prop-types';

import React from 'react';

/**
 *
 * A component that is renderered for each row of data.
 *
 * @typedef Column
 * @type ReactElement
 *
 * @prop {Object} columnProps
 * A mixture of default props and those passed through `Column.props.columnProps`. This object should
 * be able to be spread onto the svg element eg. `<rect {...props.columnProps}/>`.
 *
 * @prop {number} columnProps.x
 * The pixel x coordinate of the column rectangle's top left corner
 *
 * @prop {number} columnProps.y
 * The pixel y coordinate of the column rectangle's top left corner
 *
 * @prop {number} columnProps.width
 * The width of the column rectangle
 *
 * @prop {number} columnProps.height
 * The height of the column rectangle
 *
 * @prop {Object} dimensions
 * An object containing the `x` and `y` dimension values for this chart. As well as any other
 * dimensions defined when setting up the chart.
 *
 * @prop {number} index
 * The index for this row
 *
 * @prop {ChartData} data
 * The `ChartData` object that is being used to for this chart.
 *
 *
 * @prop {Object[]} scaledData
 * The full array of pre scaled data.
 *
 */

function DefaultColumn(props: Object): React.Element<any> {
    return <rect
        fill='black'
        {...props.columnProps}
    />;
}


/**
 *
 * @component
 *
 * ColumnRenderable is the low-level svg renderer for Column charts and Bar Charts.
 * Bar is an alias of Column and BarRenderable is an alias of ColumnRenderable
 *
 * @example
 *
 * const scaledData = [
 *     {x: 1, y: 200},
 *     {x: 2, y: 400},
 *     {x: 3, y: 600},
 *     {x: 4, y: 800},
 * ];
 *
 * return <ColumnRenderable
 *     height={1000}
 *     xScale={xScale}
 *     yScale={yScale}
 *     scaledData={scaledData}
 *     columnProps={{
 *          strokeWidth: '2'
 *     }}
 *     column={(props) => <rect {...props.columnProps} stroke="red"/>}
 * />;
 *
 *
 */


export class ColumnRenderable extends React.PureComponent {

    static propTypes = {
        /**
         * The height of the canvas.
         */
        height: PropTypes.number.isRequired,

        /**
         * The width of the canvas.
         */
        width: PropTypes.number,

        /**
         * {ChartData} The `ChartData` Record that contains the data for the chart.
         */
        data: PropTypes.object,

        /**
         * {Object} The pre-scaled data that is used to render columns
         */
        scaledData: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })).isRequired,

        /**
         * {Scale} A [d3 scale](https://github.com/d3/d3-scale) for the x axis.
         */
        xScale: PropTypes.func.isRequired,

        /**
         * {Scale} A [d3 scale](https://github.com/d3/d3-scale) for the y axis.
         */
        yScale: PropTypes.func.isRequired,

        /**
         * An object of props that will be spread onto the svg element used to render the bar/column
         * By default the svg element is a [`<rect>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)
         */
        columnProps: PropTypes.object,

        /**
         * {Column} An optional custom column renderer component.
         */
        column: PropTypes.func,

        /**
         * Force a particular orientation for the chart. `'vertical'` will render a column chart
         * and `'horizontal'` will render a bar chart. This is likely not required – in almost all
         * cases the orientation can be inferred from the scales.
         */
        orientation: PropTypes.string

    };

    static defaultProps = {
        columnProps: {},
        column: DefaultColumn
    };

    buildColumn(
        row: Object,
        index: number,
        orientation: 'vertical'|'horizontal',
        bandwidth: number
    ): React.Element<any> {
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
            columnProps={{
                x, y, width, height,
                ...this.props.columnProps
            }}
            dimensions={row}
            index={index}
            data={this.props.data}
            scaledData={this.props.scaledData}
        />;
    }

    render(): ?React.Element<any> {
        const {xScale, yScale} = this.props;
        const orientation = this.props.orientation || xScale.bandwidth
            ? 'vertical'
            :  yScale.bandwidth
                ? 'horizontal'
                : console.error('Column chart must have at least one band scale');

        if(!orientation) return null;

        const bandwidth = orientation === 'vertical' ? xScale.bandwidth() : yScale.bandwidth();

        return <g>
            {this.props.scaledData.map((row: Object, index: number): React.Element<any> => {
                return this.buildColumn(row, index, orientation, bandwidth);
            })}
        </g>;
    }
}


/**
 *
 * @component
 *
 * Component used to render column charts. This component requires further props to define what pieces
 * of data it uses. @see `Chart` for details.
 * @name Column
 *
 * @example
 * <Column
 *     column={(props) => <rect {...props.columnProps} fill='blue'/>}
 * />
 *
 */

export default class Column extends React.Component {
    static chartType = 'canvas';

    static propTypes = {
        /**
         * An object of props that will be spread onto the svg element used to render the bar/column
         * By default the svg element is a [`<rect>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)
         */
        columnProps: PropTypes.object,

        /**
         * {Column} An optional custom column renderer component.
         */
        column: PropTypes.func,

        /**
         * Force a particular orientation for the chart. `'vertical'` will render a column chart
         * and `'horizontal'` will render a bar chart. This is likely not required – in almost all
         * cases the orientation can be inferred from the scales.
         */
        orientation: PropTypes.string
    };

    render(): React.Element<any> {
        return <ColumnRenderable {...this.props} />;
    }
}

