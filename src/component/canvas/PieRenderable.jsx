// @flow

import React, {PropTypes} from 'react';
import {arc} from 'd3-shape';

/**
 *
 * A component that is renderered for each row of data.
 *
 * @typedef Column
 * @type ReactElement
 *
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
 * @prop {Map} rowData
 * An Immutable map of the raw data for this row.
 *
 * @prop {Object[]} scaledData
 * The full array of pre scaled data.
 *
 */

function DefaultArc(props: Object): React.Element<any> {
    return <path {...props.arcProps}/>;
}





export class PieRenderable extends React.PureComponent {

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
        categoryScale: PropTypes.func.isRequired,

        /**
         * {Scale} A [d3 scale](https://github.com/d3/d3-scale) for the y axis.
         */
        arcScale: PropTypes.func.isRequired,

        /**
         * An object of props that will be spread onto the svg element used to render the bar/column
         * By default the svg element is a [`<rect>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)
         */
        arcProps: PropTypes.object,

        /**
         * {Column} An optional custom column renderer component.
         */
        arc: PropTypes.func

    };

    static defaultProps = {
        arcProps: {},
        arc: DefaultArc
    };

    buildArc(
        row: Object,
        index: number,
        diameter: number
    ): React.Element<any> {
        const {arc: Arc} = this.props;

        const startAngle = this.props.scaledData
            .slice(0, index)
            .map(row => row.arc)
            .reduce((a,b) => a + b, 0);

        const arcGenerator = arc()
            .innerRadius(0)
            .outerRadius(diameter / 2)
            .startAngle(startAngle)
            .endAngle(startAngle + row.arc);

        return <Arc
            radius={diameter / 2}
            arcGenerator={arcGenerator}
            dimensions={row}
            arcProps={{
                fill: row.category,
                d: arcGenerator()
            }}
        />;
    }

    render(): ?React.Element<any> {
        const {arcScale, categoryScale} = this.props;
        const diameter = Math.min(this.props.height, this.props.width);

        return <g transform={`translate(${(this.props.width) / 2}, ${(this.props.height) / 2})`}>
            {this.props.scaledData.map((row: Object, index: number): React.Element<any> => {
                return this.buildArc(row, index, diameter);
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

export default class Pie extends React.Component {
    static chartType = 'canvas';

    static propTypes = {
        /**
         * An object of props that will be spread onto the svg element used to render the bar/column
         * By default the svg element is a [`<rect>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)
         */
        arcProps: PropTypes.object,

        /**
         * {Column} An optional custom column renderer component.
         */
        arc: PropTypes.func,

    };

    render(): React.Element<any> {
        return <PieRenderable {...this.props} />;
    }
}

