// @flow

import PropTypes from 'prop-types';
import type {Node} from 'react';
import React from 'react';
import * as d3Shape from 'd3-shape';


function DefaultLine(props: Object): Node {
    return <path
        {...props.lineProps}
    />;
}


export class LineRenderable extends React.PureComponent<*> {
    static defaultProps = {
        line: DefaultLine,
        area: false
    };

    static propTypes = {
        height: PropTypes.number.isRequired,
        data: PropTypes.object,
        scaledData: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })).isRequired,
        line: PropTypes.func,
        lineProps: PropTypes.object,
        area: PropTypes.bool,
        curveSelector: PropTypes.func
    };

    lineGenerator = d3Shape.line()
        .x((ii) => ii.x)
        .y((ii) => ii.y)
        .defined(ii => typeof ii.x === 'number' &&
                       typeof ii.y === 'number' &&
                       !isNaN(ii.x) &&
                       !isNaN(ii.y)
        );

    areaGenerator = d3Shape.area()
        .x((ii) => ii.x)
        .y1((ii) => ii.y)
        .y0(() => this.props.height)
        .defined(ii => typeof ii.x === 'number' &&
                       typeof ii.y === 'number' &&
                       !isNaN(ii.x) &&
                       !isNaN(ii.y)
        );


    render(): Node {
        const {
            data,
            line: Line,
            curveSelector,
            area,
            scaledData,
            lineProps
        } = this.props;

        const curveFunction = curveSelector
            ? curveSelector(d3Shape)
            : d3Shape.curveLinear;

        const pathGenerator = area
            ? this.areaGenerator.curve(curveFunction)
            : this.lineGenerator.curve(curveFunction);

        return <g>
            <Line
                pathGenerator={pathGenerator}
                data={data}
                scaledData={scaledData}
                lineProps={{
                    fill: area ? 'inherit' : 'none',
                    stroke: area ? 'none' : 'inherit',
                    d: pathGenerator(scaledData),
                    ...lineProps
                }}
            />
        </g>;
    }
}


class Line extends React.Component<*> {
    static chartType = 'canvas';

    static propTypes = {
        line: PropTypes.func,
        lineProps: PropTypes.object,
        area: PropTypes.bool,
        curveSelector: PropTypes.func
    };

    render(): Node {
        return <LineRenderable {...this.props} />;
    }
}

export default Line;
