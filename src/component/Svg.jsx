// @flow

import PropTypes from 'prop-types';
import type {Node} from 'react';
import React from 'react';

export default class Svg extends React.PureComponent<*> {

    static propTypes = {
        height: PropTypes.number,
        width: PropTypes.number,
        svgProps: PropTypes.object,
        stroke: PropTypes.string,
        className: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number
    };

    static defaultProps = {
        svgProps: {}
    };

    render(): Node {
        if(!this.props.width || !this.props.height) return <svg/>;

        return <svg
            overflow='visible'
            display='block'
            stroke={this.props.stroke}
            className={this.props.className}
            width={this.props.width}
            height={this.props.height}
            x={this.props.x}
            y={this.props.y}
            style={{
                ...this.props.style || {},
                boxSizing: 'border-box'
            }}
            {...this.props.svgProps}
        >
            {this.props.children}
        </svg>;
    }
}
