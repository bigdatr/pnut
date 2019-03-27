// @flow
import PropTypes from 'prop-types';
import type {Node} from 'react';
import React from 'react';



const defaultDot = (props: Object): Node => {
    return <circle fill='black' r={3} {...props.dotProps}/>;
};

const isNumber = (value) => typeof value === 'number' && !isNaN(value);

export class ScatterRenderable extends React.PureComponent<*> {
    static defaultProps = {
        dot: defaultDot
    };

    static propTypes = {
        data: PropTypes.object,
        scaledData: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })).isRequired,
        dotProps: PropTypes.object,
        dot: PropTypes.func
    };

    constructor(props: Object) {
        super(props);
    }

    buildDot(
        row: Object,
        index: number
    ): ?Node {
        if(!isNumber(row.x) || !isNumber(row.y)) return null;
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

    render(): Node {
        return <g>
            {this.props.scaledData.map((row, index) => this.buildDot(row, index))}
        </g>;
    }
}

export default class Scatter extends React.Component<*> {
    static chartType = 'canvas';

    static propTypes = {
        dotProps: PropTypes.object,
        dot: PropTypes.func
    };

    render(): Node {
        return <ScatterRenderable {...this.props} />;
    }
}

