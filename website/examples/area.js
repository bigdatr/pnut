import {Area, Chart} from 'pnut';
import React from 'react';
import ElementQueryHock from 'stampy/lib/hock/ElementQueryHock';
const data = require(process.cwd() + '/data/lineData');


class AreaExample extends React.Component {
    render() {
        return  <Chart
            width={600}
            height={600}
            data={data}
            xColumn='month'
            yColumn='supply'
        >
            <Area curveSelector={curves => curves.curveMonotoneX}/>
        </Chart>;
    }
}



module.exports = AreaExample;
