// @flow
import React, {Component, Children, cloneElement, Element} from 'react';
import {ElementQueryHock} from 'stampy';
import {List} from 'immutable';
import * as d3Scale from 'd3-scale';

import {ChartData} from 'pnut';

function defaultFunction(functionToCheck, otherwise) {
    if(typeof functionToCheck === 'function') {
        return functionToCheck;
    } else {
        return otherwise;
    }
}

class Chart extends Component {
    static propTypes = {
        // x: React.PropTypes.string,
        // scaleX: React.PropTypes.string,
        // domainX: React.PropTypes.string,

        // y: React.PropTypes.string,
        // scaleY: React.PropTypes.string,
        // domainY: React.PropTypes.string,

        // width: React.PropTypes.number,
        // height: React.PropTypes.number,
    };

    constructor(props) {
        super(props);

        const childrenProps = List(Children.map(props.children, child => {
            return {
                ...child.props,
                chartType: child.type.chartType
            };
        }))
            .groupBy(ii => ii.chartType);

        this.state = {
            columnY: childrenProps
                .get('plane2d')
                .map(ii => ii.y)
                .toArray(),
            columnX: props.range || childrenProps
                .get('plane2d')
                .map(ii => ii.y)
                .toArray()
        }

        // console.log(childrenProps, this.state);

        this.getChildProps = this.getChildProps.bind(this);
    }
    getChildProps(type, props) {
        const {width, height} = this.props;
        const {columns} = this.state;

        const chartProps = Object.assign({}, this.state, this.props, props);

        // console.log(type, chartProps);

        const scaleX = defaultFunction(chartProps.scaleX, pp => {
            return d3Scale[pp.scaleX]();
        });
        const domainX = defaultFunction(chartProps.domainX, pp => {
            return pp.data.rows.map(row => row.get(pp.x)).toArray();
        });
        const rangeX = defaultFunction(chartProps.rangeX, pp => {
            return [0, pp.width];
        });

        const scaleY = defaultFunction(chartProps.scaleY, pp => {
            return d3Scale[pp.scaleY]();
        });
        const domainY = defaultFunction(chartProps.domainY, pp => {
            return [pp.data.min(pp.columnY), pp.data.max(pp.columnY)];
        });
        const rangeY = defaultFunction(chartProps.rangeY, pp => {
            return [0, pp.height];
        });

        // const y = chartProps.y || this.chartProps.y;
        // const scaleY = chartProps.scaleY || this.chartProps.scaleY;
        // const domainY = defaultDomain(chartProps.domainY || this.chartProps.domainY);


        const scaleFunctionX = scaleX(chartProps)
            .domain(domainX(chartProps))
            .range(rangeX(chartProps));

        const scaleFunctionY = scaleY(chartProps)
            .domain(domainY(chartProps))
            .range(rangeY(chartProps));

        // const scaleY = d3Scale[chartProps.scale || this.chartProps.scaleY]()
        //     .domain([this.chartProps.data.min(columns), this.chartProps.data.max(columns)])
        //     .range([0, height])
        //     .nice();

        return {
            columnX: chartProps.x,
            columnY: chartProps.y,
            data: chartProps.data,
            height,
            scaleX: scaleFunctionX,
            scaleY: scaleFunctionY,
            width
        }

        // switch(type) {
        //     case 'plane2d':
        //         return {
        //         }

        //     case 'axis':
        //         return {
        //             scale: props.direction === 'x' ? scaleX : scaleY
        //         }

        //     default:
        //         return {};
        // }
    }
    render(): Element<any> {
        const {width, height} = this.props;

        if(!width || !height) {
            return <div></div>;
        }
        const scaledChildren = Children.map(this.props.children, child => {
            return cloneElement(child, this.getChildProps(child.type.chartType, child.props));
        });

        return <svg
            overflow='visible'
            display="block"
            {...this.props.svgProps}
            width={this.props.width}
            height={this.props.height}
        >{scaledChildren}</svg>;
    }
}



// const withEq = ElementQueryHock([]);


export default Chart;
