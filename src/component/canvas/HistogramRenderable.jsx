// @flow
import PropTypes from 'prop-types';
import type {Node} from 'react';
import React from 'react';

function DefaultColumn(props: Object): Node {
    return <rect
        fill='black'
        {...props.columnProps}
    />;
}


export class HistogramRenderable extends React.PureComponent<*> {

    static propTypes = {
        height: PropTypes.number.isRequired,
        width: PropTypes.number,
        data: PropTypes.object,
        scaledData: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })).isRequired,
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
        orientation: 'vertical'|'horizontal'
    ): Node {
        const {column: Column} = this.props;

        let x, y, width, height;

        if(orientation === 'vertical') {
            x = row.x0;
            y = row.y;
            width = row.x1 - row.x0;
            height = this.props.height - row.y;
        } else {
            x = 0;
            y = row.y0;
            width = row.x;
            height = row.y1 - row.y0;
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

    render(): ?Node {

        const sampleRow = this.props.scaledData[0];

        const orientation = this.props.orientation || sampleRow.hasOwnProperty('x0')
            ? 'vertical'
            :  sampleRow.hasOwnProperty('y0')
                ? 'horizontal'
                // eslint-disable-next-line no-console
                : console.error('Histogram renderable must be supplied binned data');

        if(!orientation) return null;

        return <g>
            {this.props.scaledData.map((row: Object, index: number): Node => {
                return this.buildColumn(row, index, orientation);
            })}
        </g>;
    }
}



export default class Histogram extends React.Component<*> {
    static chartType = 'canvas';

    static propTypes = {
        columnProps: PropTypes.object,
        column: PropTypes.func,
        orientation: PropTypes.string
    };

    render(): Node {
        return <HistogramRenderable {...this.props} />;
    }
}
