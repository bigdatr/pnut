// @flow

import PropTypes from 'prop-types';
import React from 'react';
import type {Node} from 'react';

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

function DefaultColumn(props: Object): Node {
    return <rect
        fill='black'
        {...props.columnProps}
    />;
}

const isNumber = (value) => typeof value === 'number' && !isNaN(value);

// @TODO switch to flow types
export class ColumnRenderable extends React.PureComponent<*> {

    static propTypes = {
        height: PropTypes.number.isRequired,
        width: PropTypes.number,
        data: PropTypes.object,
        scaledData: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })).isRequired,
        xScale: PropTypes.func.isRequired,
        yScale: PropTypes.func.isRequired,
        columnProps: PropTypes.object,
        column: PropTypes.func,
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
    ): Node {
        if(!isNumber(row.x) || !isNumber(row.y)) return null;
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
            key={index}
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

    render(): Node {
        const {xScale, yScale} = this.props;
        const orientation = this.props.orientation || xScale.bandwidth
            ? 'vertical'
            :  yScale.bandwidth
                ? 'horizontal'
                // eslint-disable-next-line no-console
                : console.error('Column chart must have at least one band scale');

        if(!orientation) return null;
        const bandwidth = orientation === 'vertical' ? xScale.bandwidth() : yScale.bandwidth();

        return <g>
            {this.props.scaledData.map((row: Object, index: number): Node => {
                return this.buildColumn(row, index, orientation, bandwidth);
            })}
        </g>;
    }
}


export default class Column extends React.Component<*> {
    static chartType = 'canvas';

    static propTypes = {
        columnProps: PropTypes.object,
        column: PropTypes.func,
        orientation: PropTypes.string
    };

    render(): Node {
        return <ColumnRenderable {...this.props} />;
    }
}
