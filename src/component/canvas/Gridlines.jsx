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

const defaultLine = (props: LineProps): React.Element<any> => {
    const {coordinates} = props;
    return <line {...coordinates} strokeWidth="1" stroke="grey"/>;
};

export default class Gridlines extends React.PureComponent {

    static defaultProps = {
        lineHorizontal: defaultLine,
        lineVertical: defaultLine
    };

    static propTypes = {
        lineVertical: React.PropTypes.func,
        lineHorizontal: React.PropTypes.func,
        /**
         * {Scale} Any d3-scale for the x axis.
         */
        scaleX: React.PropTypes.func.isRequired,
        /**
         * {Scale} Any d3-scale for the y axis.
         */
        scaleY: React.PropTypes.func.isRequired,
        ticksX: React.PropTypes.array.isRequired,
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
