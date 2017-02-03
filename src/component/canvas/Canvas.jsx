// @flow

import React from 'react';

/**
 *
 * @component
 *
 * Canvas is a simple wrapper component used by other canvasses to provide the wrapping SVG element.
 *
 * @prop {number} [height]
 * The height of the canvas - If this is not provided then the component's children won't render.
 *
 * @prop {number} [width]
 * The width of the canvas - If this is not provided then the component's children won't render.
 *
 * @prop {Object} [svgProps]
 * An object of props that will be spread onto the svg element.
 *
 * @example
 *
 * <Canvas width={200} height={200} svgProps{{fill: 'red'}}>
 *     <circle cx={0} cy={0} r={10}/>
 * </Canvas>
 *
 */

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
