// @flow

import PropTypes from 'prop-types';
import type {Node} from 'react';
import React from 'react';

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
    xScale: (input: any) => number,
    yScale: (input: any) => number
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
 * @prop {Scale} xScale - The x scale for the passed to the Gridlines component
 * @prop {Scale} yScale - The y scale for the passed to the Gridlines component
 */

const defaultLine = (props: LineProps): Node => {
    const {coordinates} = props;
    return <line {...coordinates} strokeWidth="1" stroke="inherit"/>;
};




/**
 *
 * @component
 *
 * Draws gridlines on the chart canvas
 *
 * @example
 *
 * <GridlinesRenderable
 *     width={1280}
 *     height={720}
 *     xScale={xScale}
 *     yScale={yScale}
 *     xTicks={['category1', 'category2', 'category3']}
 *     yTicks={yScale.ticks()}
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

export class GridlinesRenderable extends React.PureComponent<*> {

    static defaultProps = {
        lineHorizontal: defaultLine,
        lineVertical: defaultLine,
        xTicks: (scale: {ticks: () => Array<mixed>, domain: () => Array<mixed>}) => scale.ticks ? scale.ticks() : scale.domain(),
        yTicks: (scale: {ticks: () => Array<mixed>, domain: () => Array<mixed>}) => scale.ticks ? scale.ticks() : scale.domain()
    };

    static propTypes = {
        /**
         * {Line} A custom component used to render a vertical line.
         * Defaults to rendering a svg `<line/>`.
         */
        lineVertical: PropTypes.func,

        /**
         * {Line} A custom component used to render a horizontal line.
         * Defaults to rendering a `<line/>`.
         */
        lineHorizontal: PropTypes.func,

        /**
         * {Scale} Any d3-scale for the x axis.
         */
        xScale: PropTypes.func.isRequired,

        /**
         * {Scale} Any d3-scale for the y axis.
         */
        yScale: PropTypes.func.isRequired,

        /**
         * An array of ticks to render as vertical gridlines. In most cases this can be constructed
         * by calling the scale's [`ticks`](https://github.com/d3/d3-scale#continuous_ticks) function.
         */
        xTicks: PropTypes.func,

        /**
         * An array of ticks to render as horizontal gridlines. In most cases this can be constructed
         * by calling the scale's [`ticks`](https://github.com/d3/d3-scale#continuous_ticks) function.
         */
        yTicks: PropTypes.func
    };

    buildHorizontalGridlines(): Array<Node> {
        const LineHorizontal = this.props.lineHorizontal;

        const rangeX = this.props.xScale.range();
        const rangeY = this.props.yScale.range();
        const offset = this.props.yScale.bandwidth ? this.props.yScale.bandwidth() / 2 : 0;

        const [x1, x2] = rangeX;

        return this.props.yTicks(this.props.yScale).map((tick: any): Node  => {
            const y1 = rangeY[1] - (this.props.yScale(tick) + offset);
            const y2 = y1;

            return <LineHorizontal
                key={tick}
                coordinates={{x1,x2,y1,y2}}
                tick={tick}
                xScale={this.props.xScale}
                yScale={this.props.yScale}
            />;
        });
    }

    buildVerticalGridlines(): Array<Node> {
        const LineVertical = this.props.lineVertical;

        const rangeY = this.props.yScale.range();
        const offset = this.props.xScale.bandwidth ? this.props.xScale.bandwidth() / 2 : 0;

        const [y1, y2] = rangeY;

        return this.props.xTicks(this.props.xScale).map((tick: any): Node => {
            const x1 = this.props.xScale(tick) + offset;
            const x2 = x1;

            return <LineVertical
                key={tick}
                coordinates={{x1,x2,y1,y2}}
                tick={tick}
                xScale={this.props.xScale}
                yScale={this.props.yScale}
            />;
        });
    }

    render(): Node {
        return <g>
            <g>
                {this.buildHorizontalGridlines()}
            </g>
            <g>
                {this.buildVerticalGridlines()}
            </g>
        </g>;
    }
}

export default class Gridlines extends React.Component<*> {
    static chartType = 'canvas';
    render(): Node {
        return <GridlinesRenderable {...this.props} />;
    }
}
