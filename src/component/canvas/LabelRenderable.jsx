// @flow

import PropTypes from 'prop-types';

import React from 'react';


const defaultLabel = (props: Object): React.Element<any> => {
    return <text
        fontSize="12"
        textAnchor="middle"
        stroke="none"
        {...props.labelProps}
    />;
};

const isNumber = (value) => typeof value === 'number' && !isNaN(value);



export class LabelRenderable extends React.PureComponent {
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

    buildLabel: any; // shut up flow

    constructor(props: Object) {
        super(props);
        this.buildLabel = this.buildLabel.bind(this);
    }

    buildLabel(
        row: Object,
        index: number
    ): ?React.Element<any> {
        const {label: Label, labelProps} = this.props;
        const rawRow = this.props.data.rows.get(index);
        const labelText = this.props.labelTextFromRow(rawRow);
        return labelText && <Label
            key={index}
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

    render(): React.Element<any> {
        return <g>
            {this.props.scaledData
                .filter(row => isNumber(row.x) && isNumber(row.y))
                .map(this.buildLabel)}
        </g>;
    }
}

export default class Label extends React.Component {
    static chartType = 'canvas';

    static propTypes = {
        labelOffset: PropTypes.arrayOf(PropTypes.number),
        labelTextFromRow: PropTypes.func,
        labelProps: PropTypes.object,
        label: PropTypes.func
    };

    render(): React.Element<any> {
        return <LabelRenderable {...this.props} />;
    }
}
