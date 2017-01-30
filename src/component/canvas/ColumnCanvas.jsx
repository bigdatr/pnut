// @flow

import React from 'react';
import Canvas from './Canvas';
import type ChartRow from 'src/chartdata/ChartData';


export default class ColumnCanvas extends React.PureComponent {
    static defaultProps = {
        columnProps: []
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
        columnY: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.arrayOf(React.PropTypes.string)
        ]).isRequired,
        columnProps: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.arrayOf(React.PropTypes.object)
        ]).isRequired
    };

    buildColumns(): Array<React.Element<any>> {
        return this.props.data.rows.reduce((
            columns: Array<React.Element<any>>,
            row: ChartRow
        ): Array<React.Element<any>> => {

            const {scaleX, scaleY, columnX, columnY, columnProps} = this.props;
            const rangeY = this.props.scaleY.range();

            const columnYList = [].concat(columnY);
            const columnPropsList = [].concat(columnProps);
            const columnWidth = scaleX.bandwidth() / columnY.length;

            const newColumns = columnYList.map((
                columnY: string,
                index: number
            ): React.Element<any> => {
                return <rect
                    key={`${row.get(columnX)}-${columnY}`}
                    fill='black'
                    {...columnPropsList[index]}
                    x={scaleX(row.get(columnX)) + columnWidth * index}
                    y={rangeY[1] - scaleY(row.get(columnY))}
                    width={columnWidth}
                    height={scaleY(row.get(columnY))}
                />;
            });

            return columns.concat(newColumns);
        }, []);
    }

    render(): React.Element<any> {
        return <Canvas {...this.props}>
            {this.buildColumns()}
        </Canvas>;
    }
}
