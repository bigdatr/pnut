// @flow

import React from 'react';
import Canvas from './Canvas';
import type {ChartScalar, ChartRow} from 'src/chartdata/ChartData';

type DotProps = {
    key: string,
    x: number,
    y: number,
    dataX: ChartScalar,
    dataY: ChartScalar,
    row: ChartRow
};

const defaultDot = (dotProps: DotProps): React.Element<any> => {
    const {x, y, key} = dotProps;
    return <circle fill='black' key={key} cx={x} cy={y} r={3}/>;
};

export default class ScatterCanvas extends React.PureComponent {

    static defaultProps = {
        dot: defaultDot
    };

    static propTypes = {
        // Props passed to canvas
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        svgProps: React.PropTypes.object,
        // Own props
        data: React.PropTypes.object.isRequired,
        scaleX: React.PropTypes.func.isRequired,
        scaleY: React.PropTypes.func.isRequired,
        columnX: React.PropTypes.string.isRequired,
        columnY: React.PropTypes.string.isRequired,
        dot: React.PropTypes.func
    };

    buildDots(): Array<React.Element<any>> {
        const {data, scaleX, scaleY, columnX, columnY, dot} = this.props;

        return data.rows.map((row: ChartRow, index: number): React.Element<any> => {
            const dataX = row.get(columnX);
            const dataY = row.get(columnY);
            const rangeY = scaleY.range();

            return dot({
                key: index, // @TODO is this ok?
                x: scaleX(dataX),
                y: rangeY[1] - scaleY(dataY),
                dataX,
                dataY,
                row
            });
        });
    }

    render(): React.Element<any> {
        return <Canvas {...this.props}>
            {this.buildDots()}
        </Canvas>;
    }
}
