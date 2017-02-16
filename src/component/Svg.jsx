// @flow

import React from 'react';

/**
 *
 * @component
 *
 * Svg is a simple wrapper component used by other canvasses to provide the wrapping SVG element.
 *
 * @example
 *
 * <Svg width={200} height={200} svgProps{{fill: 'red'}}>
 *     <circle cx={0} cy={0} r={10}/>
 * </Svg>
 *
 */

export default class Svg extends React.PureComponent {

    static propTypes = {
        /**
         * The height of the canvas -
         * If this is not provided then the component's children won't render.
         */
        height: React.PropTypes.number,
        /**
         * The width of the canvas -
         * If this is not provided then the component's children won't render.
         */
        width: React.PropTypes.number,

        /** An object of props that will be spread onto the svg element. */
        svgProps: React.PropTypes.object,

        className: React.PropTypes.string,

        /** The x position of the canvas */
        x: React.PropTypes.number,

        /** The y position of the canvas */
        y: React.PropTypes.number
    };

    static defaultProps = {
        svgProps: {}
    };

    render(): React.Element<any> {
        if(!this.props.width || !this.props.height) return <svg/>;

        return <svg
            overflow='visible'
            display='block'
            className={this.props.className}
            width={this.props.width}
            height={this.props.height}
            x={this.props.x}
            y={this.props.y}
        >
            {this.props.children}
        </svg>;
    }
}
