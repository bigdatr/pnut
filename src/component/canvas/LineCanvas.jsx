// @flow

import React from 'react';
import Canvas from './Canvas';
import type ChartRow from 'src/chartdata/ChartData';

export default class LineCanvas extends React.PureComponent {
    static defaultProps = {
        pathProps: {}
    };

    static propTypes = {
        // Props passed to canvas
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        svgProps: React.PropTypes.object,
        // Own Props
        data: React.PropTypes.object.isRequired,
        scaleX: React.PropTypes.func.isRequired,
        scaleY: React.PropTypes.func.isRequired,
        columnX: React.PropTypes.string.isRequired,
        columnY: React.PropTypes.string.isRequired,
        pathProps: React.PropTypes.object
    };

    buildPath(): string {
        const {data, scaleX, scaleY, columnX, columnY} = this.props;
        return data.rows.map((row: ChartRow, index: number): string => {
            const command = index === 0 ? 'M' : 'L';
            const rangeY = scaleY.range();
            return `${command} ${scaleX(row.get(columnX))} ${rangeY[1] - scaleY(row.get(columnY))}`;
        }).join(' ');
    }

    render(): React.Element<any> {
        return <Canvas {...this.props}>
            <path
                fill='none'
                stroke='black'
                strokeWidth='1'
                {...this.props.pathProps}
                d={this.buildPath()}
            />
        </Canvas>;
    }
}
