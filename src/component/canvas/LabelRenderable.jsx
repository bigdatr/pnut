// @flow

import PropTypes from 'prop-types';
import type {Node} from 'react';
import React from 'react';


const defaultLabel = (props: Object): Node => {
    return <text
        fontSize="12"
        textAnchor="middle"
        stroke="none"
        {...props.labelProps}
    />;
};

const isNumber = (value) => typeof value === 'number' && !isNaN(value);



export class LabelRenderable extends React.PureComponent<*> {
    static defaultProps = {
        label: defaultLabel,
        labelOffset: [0, 0]
    };

    static propTypes = {
        data: PropTypes.object,
        scaledData: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })).isRequired,
        labelProps: PropTypes.object,
        labelTextFromRow: PropTypes.func,
        labelOffset: PropTypes.arrayOf(PropTypes.number),
        label: PropTypes.func
    };

    constructor(props: Object) {
        super(props);
    }

    buildLabel(
        row: Object,
        index: number
    ): ?Node {
        if(!isNumber(row.x) || !isNumber(row.y)) return null;
        const {label: Label, labelProps} = this.props;
        const rawRow = this.props.data.rows[index];
        const labelText = this.props.labelTextFromRow(rawRow);

        return labelText && <Label
            key={index}
            x={row.x + this.props.labelOffset[0]}
            y={row.y + this.props.labelOffset[1]}
            labelProps={{
                children: labelText,
                x: row.x + this.props.labelOffset[0],
                y: row.y + this.props.labelOffset[1],
                ...labelProps
            }}
            dimensions={row}
            index={index}
            data={this.props.data}
            scaledData={this.props.scaledData}
        />;
    }

    render(): Node {
        return <g>
            {this.props.scaledData.map((row, index) => this.buildLabel(row, index))}
        </g>;
    }
}

export default class Label extends React.Component<*> {
    static chartType = 'canvas';

    static propTypes = {
        labelOffset: PropTypes.arrayOf(PropTypes.number),
        labelTextFromRow: PropTypes.func,
        labelProps: PropTypes.object,
        label: PropTypes.func
    };

    render(): Node {
        return <LabelRenderable {...this.props} />;
    }
}
