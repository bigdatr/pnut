// @flow

import React from 'react';

export default class Canvas extends React.PureComponent {

    static defaultProps = {
        svgProps: {}
    };

    static propTypes = {
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        svgProps: React.PropTypes.object
    };

    render(): React.Element<any> {
        if(!this.props.width || !this.props.height) return <svg></svg>;

        return <svg
            overflow='visible'
            {...this.props.svgProps}
            width={this.props.width}
            height={this.props.height}
        >
            {this.props.children}
        </svg>;
    }
}
