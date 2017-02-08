// @flow

import React from 'react';
import Canvas from './Canvas';

type LineCoordinates = {
    x1: number,
    y1: number,
    x2: number,
    y2: number
};

type LineProps = {
    key: string,
    coordinates: LineCoordinates,
    tick: any,
    scaleX: (input: any) => number,
    scaleY: (input: any) => number
};


/**
 *
 * @typedef Line
 * @type ReactElement
 *
 * @prop {Object} coordinates - The coordinates needed to draw the line
 * @prop {number} coordinates.x1 - The starting x position of the line
 * @prop {number} coordinates.y1 - The starting y position of the line
 * @prop {number} coordinates.x2 - The ending x position of the line
 * @prop {number} coordinates.y2 - The ending y position of the line
 *
 * @prop {*} tick - The tick value for this gridline
 * @prop {Scale} scaleX - The x scale for the passed to the Gridlines component
 * @prop {Scale} scaleY - The y scale for the passed to the Gridlines component
 */

const defaultLine = (props: LineProps): React.Element<any> => {
    const {coordinates} = props;
    return <line {...coordinates} strokeWidth="1" stroke="grey"/>;
};




/**
 *
 * @component
 *
 * Draws gridlines on the chart canvas
 *
 * @example
 *
 * <Gridlines
 *     width={1280}
 *     height={720}
 *     scaleX={scaleX}
 *     scaleY={scaleY}
 *     ticksX={['category1', 'category2', 'category3']}
 *     ticksY={scaleY.ticks()}
 *
 *     // optional custom lines
 *     lineHorizontal={(props) => {
 *         const {coordinates, tick} = props;
 *         return <line {...coordinates} strokeWidth="1" stroke="rgba(0,0,0,0.2)"/>
 *     }}
 *
 *     lineVertical={(props) => {
 *         const {coordinates, tick, scale} = props;
 *         return <rect x={coordinates.x1 - scale.bandwidth() / 2} y={coordinates.y1} width={scale.bandwidth()} height={coordinates.y2 - coordinates.y1} fill='rgba(0,0,0,0.1)'/>
 *     }}
 * />
 *
 */

export default class Gridlines extends React.PureComponent {

    static defaultProps = {
        lineHorizontal: defaultLine,
        lineVertical: defaultLine
    };

    static propTypes = {
        /**
         * {Line} A custom component used to render a vertical line.
         * Defaults to rendering a svg `<line/>`.
         */
        lineVertical: React.PropTypes.func,

        /**
         * {Line} A custom component used to render a horizontal line.
         * Defaults to rendering a `<line/>`.
         */
        lineHorizontal: React.PropTypes.func,

        /**
         * {Scale} Any d3-scale for the x axis.
         */
        scaleX: React.PropTypes.func.isRequired,

        /**
         * {Scale} Any d3-scale for the y axis.
         */
        scaleY: React.PropTypes.func.isRequired,

        /**
         * An array of ticks to render as vertical gridlines. In most cases this can be constructed
         * by calling the scale's [`ticks`](https://github.com/d3/d3-scale#continuous_ticks) function.
         */
        ticksX: React.PropTypes.array.isRequired,

        /**
         * An array of ticks to render as horizontal gridlines. In most cases this can be constructed
         * by calling the scale's [`ticks`](https://github.com/d3/d3-scale#continuous_ticks) function.
         */
        ticksY: React.PropTypes.array.isRequired
    };

    buildHorizontalGridlines(): Array<React.Element<any>> {
        const LineHorizontal = this.props.lineHorizontal;

        const rangeX = this.props.scaleX.range();
        const rangeY = this.props.scaleY.range();
        const offset = this.props.scaleY.bandwidth ? this.props.scaleY.bandwidth() / 2 : 0;

        const [x1, x2] = rangeX;

        return this.props.ticksY.map((tick: any): React.Element<any>  => {
            const y1 = rangeY[1] - (this.props.scaleY(tick) + offset);
            const y2 = y1;

            return <LineHorizontal
                key={tick}
                coordinates={{x1,x2,y1,y2}}
                tick={tick}
                scaleX={this.props.scaleX}
                scaleY={this.props.scaleY}
            />;
        });
    }

    buildVerticalGridlines(): Array<React.Element<any>> {
        const LineVertical = this.props.lineVertical;

        const rangeY = this.props.scaleY.range();
        const offset = this.props.scaleX.bandwidth ? this.props.scaleX.bandwidth() / 2 : 0;

        const [y1, y2] = rangeY;

        return this.props.ticksX.map((tick: any): React.Element<any> => {
            const x1 = this.props.scaleX(tick) + offset;
            const x2 = x1;

            return <LineVertical
                key={tick}
                coordinates={{x1,x2,y1,y2}}
                tick={tick}
                scaleX={this.props.scaleX}
                scaleY={this.props.scaleY}
            />;
        });
    }

    render(): React.Element<any> {
        return <Canvas {...this.props}>
            <g>
                {this.buildHorizontalGridlines()}
            </g>
            <g>
                {this.buildVerticalGridlines()}
            </g>
        </Canvas>;
    }
}
