// @flow

import React, {PropTypes} from 'react';


export class GraphRenderable extends React.PureComponent {

    buildPath() {
        var path = '';
        var x = 0;

        while(x <= this.props.width) {
            var command = path ? ' L' : ' M';
            var scaledX = this.props.xScale.invert(x);
            var y = this.props.yScale(this.props.data(scaledX));

            if(!x || !y) {
                x = x + 1;
                continue;
            };

            path = path + command + x + ' ' + (this.props.height - y);
            x = x + 1;
        }
        return path;
    }

    render(): React.Element<any> {
        var start = performance.now();
        var d = this.buildPath();
        console.log(performance.now() - start);

        return <g>
            <path d={d} stroke='black' strokeWidth={1} fill='none'/>
        </g>;
    }
}


class Graph extends React.Component {
    static chartType = 'canvas';


    render(): React.Element<any> {
        return <GraphRenderable {...this.props} />;
    }
}

export default Graph;


