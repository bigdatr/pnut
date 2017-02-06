// @flow

import React from 'react';
import {ElementQueryHock} from 'stampy';
import * as d3Scale from 'd3-scale';

import {ChartData} from 'pnut';


type HockConfig = (props: Object) => Object;

const ChartDecorator = (
    config: HockConfig = (props) => props,
    propMapper: HockConfig = (props) => props
): HockApplier => {
    return (ComposedComponent: ReactClass<any>): ReactClass<any> => {


        /**
         * @component
         * TODO: Chart descrtiption
         *
         * @example
         * TODO: Canvas Example
         */
        return class Chart extends React.PureComponent {

            static defaultProps = {
                scaleX: 'scaleLinear',
                scaleY: 'scaleLinear'
            };

            static propTypes = {
                chartData: React.PropTypes.instanceOf(ChartData),
                scaleX: React.PropTypes.string,
                scaleY: React.PropTypes.string
            };

            render(): React.Element<any> {
                const scales = config(this.props)
                    .map(scale => {
                        const {type, rangeMin, rangeMax}
                        return d3Scale[scale.type]
                    })

                const hockProps = {
                    scales
                }

                return <ComposedComponent
                    {...this.props}
                    {...propMapper(hockProps)}
                />;
            }
        }



// const withEq = ElementQueryHock([]);


export default Chart;
