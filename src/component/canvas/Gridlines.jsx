// @flow

import React from 'react';
import Canvas from './Canvas';

const defaultLine = (props) => {
    const {coordinates, tick, scale} = props;
    return <line {...coordinates} strokeWidth="1" stroke="grey"/>
}

export default class Gridlines extends React.PureComponent {

    static defaultProps = {
        lineHorizontal: defaultLine,
        lineVertical: defaultLine
    };

    static propTypes = {

    };

    buildHorizontalGridlines() {
        const LineHorizontal = this.props.lineHorizontal;

        const rangeX = this.props.scaleX.range();
        const rangeY = this.props.scaleY.range();

        const [x1, x2] = rangeX;

        return this.props.ticksY.map(tick => {
            const y1 = rangeY[1] - this.props.scaleY(tick);
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

    buildVerticalGridlines() {
        const LineVertical = this.props.lineVertical;

        const rangeY = this.props.scaleY.range();

        const [y1, y2] = rangeY;

        return this.props.ticksX.map(tick => {
            const x1 = this.props.scaleX(tick);
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
            {this.buildHorizontalGridlines()}
            {this.buildVerticalGridlines()}
        </Canvas>;
    }
}
