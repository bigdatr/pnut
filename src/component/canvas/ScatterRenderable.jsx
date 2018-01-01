// @flow

import PropTypes from 'prop-types';

import React from 'react';


/**
 *
 * @typedef Dot
 * @type ReactElement
 *
 * @prop {Object} dotProps
 * A mixture of default props and those passed through `Scatter.props.dotProps`. This object should
 * be able to be spread onto the svg element eg. `<circle {...props.columnProps}/>`.
 *
 * @prop {number} dotProps.cx
 * The pixel x coordinate of the dot's centre
 *
 * @prop {number} dotProps.cy
 * The pixel y coordinate of dot's centre
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
 */

const defaultDot = (props: Object): React.Element<any> => {
    return <circle fill='black' r={3} {...props.dotProps}/>;
};

const isNumber = (value) => typeof value === 'number' && !isNaN(value);

/**
 *
 * @component
 *
 * ScatterRenderable is the low-level svg renderer for Scatter charts.
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
 * return <ScatterRenderable
 *     scaledData={scaledData}
 *     dotProps={{
 *          strokeWidth: '2'
 *     }}
 *     dot={(props) => <circle {...props.columnProps} stroke="red"/>}
 * />;
 *
 *
 */

export class ScatterRenderable extends React.PureComponent {
    static defaultProps = {
        dot: defaultDot
    };

    static propTypes = {

        /**
         * {ChartData} The `ChartData` Record used to contain the data for the chart.
         */
        data: PropTypes.object,

        /**
         * {Object} The pre-scaled data that is used to render points
         */
        scaledData: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })).isRequired,

        /**
         * An object of props that will be spread onto the svg element used to display dots on the chart.
         */
        dotProps: PropTypes.object,

        /**
         * {Dot} An optional react component that will be used to render dots on the chart.
         * Defaults to rendering a `<circle/>`.
         */
        dot: PropTypes.func
    };

    buildDot: any; // shut up flow

    constructor(props: Object) {
        super(props);
        this.buildDot = this.buildDot.bind(this);
    }

    buildDot(
        row: Object,
        index: number
    ): ?React.Element<any> {
        const {dot: Dot, dotProps} = this.props;
        return <Dot
            key={index}
            dotProps={{
                cx: row.x,
                cy: row.y,
                ...dotProps
            }}
            dimensions={row}
            index={index}
            data={this.props.data}
            scaledData={this.props.scaledData}
        />;
    }

    render(): React.Element<any> {
        return <g>
            {this.props.scaledData
                .filter(row => isNumber(row.x) && isNumber(row.y))
                .map(this.buildDot)}
        </g>;
    }
}

/**
 *
 * @component
 *
 * Component used to render scatter/point charts. This component requires further props to define
 * what pieces of data it uses. @see `Chart` for details.
 * @name Scatter
 *
 * @example
 * <Scatter
 *     dot={(props) => <circle {...props.dotProps} fill='blue'/>}
 * />
 *
 */

export default class Scatter extends React.Component {
    static chartType = 'canvas';

    static propTypes = {
        /**
         * An object of props that will be spread onto the svg element used to display dots on the chart.
         */
        dotProps: PropTypes.object,

        /**
         * {Dot} An optional react component that will be used to render dots on the chart.
         * Defaults to rendering a `<circle/>`.
         */
        dot: PropTypes.func
    };

    render(): React.Element<any> {
        return <ScatterRenderable {...this.props} />;
    }
}
