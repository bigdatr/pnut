// @flow

import React from 'react';
import Canvas from '../canvas/Canvas';

export default class AxisX extends React.PureComponent {

    static defaultProps = {
        position: 'top',
        lineProps: {},
        tickProps: {},
        textProps: {},
        textFormat: (text) => text,
        tickSize: 6,
        textPadding: 6,
        overlap: 0
    };

    static propTypes = {
        position: React.PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
        lineProps: React.PropTypes.object,
        tickProps: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.func
        ]),
        textProps: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.func
        ]),
        textFormat: React.PropTypes.func,
        tickSize: React.PropTypes.number,
        textPadding: React.PropTypes.number,
        overlap: React.PropTypes.number,
        scale: React.PropTypes.func.isRequired,
        ticks: React.PropTypes.array.isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    };

    defaultLineWidth = 1;


    drawTicks(): Array<React.Element<any>> {
        const tickSize = this.props.tickSize;
        const strokeWidth = this.props.lineProps.strokeWidth || this.defaultLineWidth;
        const offset = this.props.scale.bandwidth ? this.props.scale.bandwidth() / 2 : 0;

        return this.props.ticks.map((tick: any): React.Element<any> => {
            const distance = this.props.scale(tick) + offset;

            const [x1, y1] = this.getPointPosition(distance, strokeWidth / 2);
            const [x2, y2] = this.getPointPosition(distance, strokeWidth / 2 + tickSize);

            const [textX, textY] = this.getPointPosition(
                distance,
                strokeWidth / 2 + tickSize + this.props.textPadding
            );

            return <g
                key={tick}
            >
                <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke='black'
                    strokeWidth={1}
                    {...(
                        typeof this.props.tickProps === 'function'
                            ? this.props.tickProps(tick, x1, y1, this.props.scale)
                            : this.props.tickProps
                    )}
                />

                <text
                    x={textX}
                    y={textY}
                    textAnchor={this.getTextAnchorProp()}
                    dominantBaseline={this.getAlignmentBaselineProp()}
                    fontSize={12}
                    {...(
                        typeof this.props.textProps === 'function'
                            ? this.props.textProps(tick, textX, textY, this.props.scale)
                            : this.props.textProps
                    )}
                >
                    {this.props.textFormat(tick)}
                </text>
            </g>;
        });
    }

    drawAxis(): React.Element<any> {
        const strokeWidth = this.props.lineProps.strokeWidth || this.defaultLineWidth;
        const overlap = this.props.overlap;

        const [x1, y1] = this.getPointPosition(overlap * -1, 0);
        const [x2, y2] = this.getPointPosition(this.props[this.getLengthProp()] + overlap, 0);

        return <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke='black'
            strokeWidth={strokeWidth}
            {...this.props.lineProps}
        />;
    }

    getAlignmentBaselineProp(): string {
        switch(this.props.position) {
            case 'left':
            case 'right':
                return 'middle';
            case 'top':
                return 'baseline';
            case 'bottom':
                return 'hanging';
            default:
                throw new Error(`unknown position: ${this.props.position}`);
        }
    }

    getTextAnchorProp(): string {
        switch(this.props.position) {
            case 'top':
            case 'bottom':
                return 'middle';
            case 'left':
                return 'end';
            case 'right':
                return 'start';
            default:
                throw new Error(`unknown position: ${this.props.position}`);
        }
    }

    getLengthProp(): string {
        return this.props.position === 'top' || this.props.position === 'bottom' ? 'width' : 'height';
    }

    getPointPosition(distance: number, offset: number): Array<number> {
        switch(this.props.position) {
            case 'top':
                return [distance, this.props.height - offset];
            case 'right':
                return [offset, distance];
            case 'bottom':
                return [distance, offset];
            case 'left':
                return [this.props.width - offset, distance];
            default:
                throw new Error(`unknown position: ${this.props.position}`);
        }
    }

    render(): React.Element<any> {
        return <Canvas {...this.props}>
            <g>
                {this.drawAxis()}
                {this.drawTicks()}
            </g>
        </Canvas>;
    }
}
