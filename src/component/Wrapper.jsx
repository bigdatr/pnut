// @flow
import React, {Component, Children, cloneElement, Element, PropTypes} from 'react';
import {List, Map, Set} from 'immutable';
import Svg from './Svg';
import applyDimension from '../util/applyDimension';
import applyScaledValue from '../util/applyScaledValue';
import applyPrimitiveDimensionProps from '../util/applyPrimitiveDimensionProps';
import defaultScale from '../util/defaultScale';
import {mapChildren} from '../util/childHelpers';

import type ChartRow from 'src/chartdata/ChartData';

/**
 * @component
 *
 * Chart is an organizer for D3's scales. Using the dimensions array it constructs a number of
 * scales. It checks its children's props and applies to them the scale configurations it found.
 *
 * Each scale creates 4 dynamic props on the Chart and each of it's children.
 *  * &lt;dimensionName&gt;Column
 *  * &lt;dimensionName&gt;ScaleType
 *  * &lt;dimensionName&gt;ScaleUpdate
 *
 * Each child will inherit any of these dimension props from the Chart component.
 * While declaring them on the child will override the parent value. This lets you declare common axis on the
 * Chart component and specific axis on the relevant child. This flexibility makes chart construction
 * expressive and highly customizable.
 *
 *
 * ```
 * <Chart data={data} xColumn="time">
 *     <Line yColumn="distance"/>
 *     <Line yColumn="velocity"/>
 *     <Axis dimension="y" position="left" />
 *     <Axis dimension="x" position="bottom" />
 * </Chart>
 * ```
 *
 *
 * @prop {string} <dimensionName>Column
 * Picks the dimension of ChartData that this scale corresponds to.
 * e.g. `<Chart dimensions={['x', 'y', 'color']} xColumn="time" yColumn="distance" colorColumn="velocity" />`
 *
 * @prop {string} [<dimensionName>ScaleType = scaleLinear]
 * Picks the starting D3 scale
 * e.g. `<Chart xScaleType="scalePoint" yScaleType="scaleLinear" />`
 *
 * @prop {function} [<dimensionName>ScaleUpdate]
 * Called with scale and props after the default scale has been constructed
 * e.g. `<Chart xScaleUpdate={scale => scale.padding(.1)} />`
 *
 *
 * @example
 *
 * // Line chart
 * <Chart data={data} xColumn="time">
 *     <Line yColumn="distance"/>
 *     <Axis yColumn="distance" position="left" />
 *     <Axis xColumn="time" position="bottom" />
 * </Chart>
 *
 * // Column chart
 * <Chart data={data} xColumn="favoriteColor">
 *     <Column yColumn="people"/>
 * </Chart>
 *
 * // Point scale scatter plot
 * <Chart data={data} xColumn="favColor" xScaleType="scalePoint">
 *     <Line yColumn="distance"/>
 * </Chart>
 *
 * // Extended scale (column chart with extra padding)
 * <Chart data={data} xColumn="favoriteColor" xScale={scale => scale.padding(1)}>
 *     <Column yColumn="people"/>
 * </Chart>
 *
 * // Complete custom scale
 * var customScale = (scale, props) => {
 *     return scaleLog()
 *          .domain([props.data.min('distance'), pp.data.max('distance')])
 *          .range([0, props.height]);
 * }
 * <Chart data={data} xColumn="time" yScaleUpdate={customScale}>
 *     <Line yColumn="distance"/>
 * </Chart>
 *
 *
 * // Correlated Scales
 * <Chart xColumn="days">
 *    <Axis dimension="x"/>
 *    <Chart yColumn="piracy">
 *        <Line/>
 *        <Axis dimension="y"/>
 *    </Chart>
 *    <Chart yColumn="lemonImports">
 *        <Line/>
 *        <Axis dimension="y"/>
 *    </Chart>
 * </Chart>
 */
class Wrapper extends Component {
    chartType: string;
    getChildProps: Function;
    dimensions: Map;
    scaledData: Map;
    state: Object;

    static propTypes = {
        /**
         * Dimensions to construct scales off
         */
        dimensions: PropTypes.arrayOf(PropTypes.string),

        /**
         * Total height of the chart.
         */
        height: PropTypes.number,

        /**
         * Total width of the chart
         */
        width: PropTypes.number,

        /**
         * [top, right, bottom, left] Padding for axis and things.
         * Renderable height is: height - top - bottom.
         * Renderable width is: width - left - right.
         */
        padding: PropTypes.arrayOf(PropTypes.number)
    };

    static chartType = 'wrapper';

    static defaultProps = {
        wrapper: Svg,
        wrapperProps: {}
    }

    constructor(props: Object) {
        super(props);

        this.dimensions = this.getDimensions(props);
        this.scaledData = this.getScaledData(props);

        this.getChildProps = this.getChildProps.bind(this);
    }
    componentWillReceiveProps(nextProps: Object) {
        this.dimensions = this.getDimensions(nextProps);
        this.scaledData = this.getScaledData(nextProps);
    }
    getDimensions(props: Object): Object {

        // collect the children propTypes and merge chartType
        const childrenProps = Children.toArray(props.children)
            .map((child: Element<any>): Object => {
                // make each child inherit chart.props
                return Map({
                    ...props,
                    ...child.props,
                    chartType: child.type.chartType
                });
            });

        return props
            .dimensions
            // turn dimension array into dimension map
            .reduce((groups: Map, dimensionName: string): Object => {
                const columnKey = `${dimensionName}Column`;
                const scaleKey = `${dimensionName}Scale`;
                const scaleTypeKey = `${dimensionName}ScaleType`;
                const scaleUpdateKey = `${dimensionName}ScaleUpdate`;

                const columns = List(childrenProps)
                    // concat default columns onto child columns
                    .map((child: Map): List<string> => {
                        return List()
                            .concat(child.get(columnKey))
                            .concat(props[columnKey]);
                    })
                    .flatten(1)
                    .toSet()
                    .filter(ii => ii);

                const dimension = Map({
                    columnKey,
                    columns,
                    scaleKey,
                    scaleTypeKey,
                    scaleUpdateKey,
                    scales: columns.reduce((scales: Map, column: string, key: string, columns: Set): Map => {
                        const scaleUpdate = typeof props[scaleUpdateKey] === 'function' ? props[scaleUpdateKey] : scale => scale;
                        // to calculate the scale you need
                        // primitiveDimension (range)
                        // columns (domain)
                        // scaleType
                        // primitiveDimensionProps (range)
                        // data (domain)

                        // set(scaleUpdate(defaultScale, props))
                        return scales.set(
                            column,
                            scaleUpdate(
                                defaultScale({
                                    primitiveDimension: dimensionName,
                                    columns: columns,
                                    scaleType: props[scaleTypeKey],
                                    primitiveDimensionProps: applyPrimitiveDimensionProps(dimensionName, this.props),
                                    data: props.data
                                }),
                                props
                            )
                        );
                    }, Map())
                });


                // group children by their scaleGroup name (defaults to dimensionName)
                return groups.set(dimensionName, dimension);
            }, Map());
    }
    getScaledData(props: Object): List {
        const data = props.frame || props.data;
        return data.rows.map((row: ChartRow): Map => {
            return this.dimensions.map((dimension: Map, dimensionName: string): Map => {
                return dimension
                    .get('scales')
                    .map((scale: Function, value: string): * => {
                        return applyScaledValue(
                            dimensionName,
                            scale,
                            row.get(value),
                            props
                        );
                    });
            });
        });
    }

    getChildProps(props: Object): Object {
        const inheritedProps = Map({
            ...this.props,
            ...props
        });

        // Create custom scales from dimensions if required
        const customScales = this.dimensions
            .map((dimension: Map, dimensionName: string): Map => {
                const {scaleUpdate, scaleTypeName} = applyDimension(dimension, Map(props)).toObject();

                // if child has defined either a custom scale or scaleType
                // we need to recreate the scale based on the custom props
                if(scaleUpdate || scaleTypeName) {
                    const scale = defaultScale({
                        primitiveDimension: dimensionName,
                        columns: this.dimensions.getIn([dimensionName, 'columns']),
                        scaleType: scaleTypeName,
                        primitiveDimensionProps: applyPrimitiveDimensionProps(dimensionName, inheritedProps.toObject()),
                        data: inheritedProps.get('data')
                    });

                    // if custom scale is a function pass the default scale through it.
                    return typeof scaleUpdate === 'function' ? scaleUpdate(scale.copy(), inheritedProps.toObject()) : scale;
                } else {
                    return null;
                }
            });


        // Create functions to get a value for each row for each dimension
        const getters = this.dimensions
            .map((dimension: Map, dimensionName: string): Map => {
                const customScale = customScales.get(dimensionName);

                // If this dimension has a custom scale then use it rather than the pre-scaled data
                if(customScale) {
                    return (index: number, key: string): * => {
                        const value = inheritedProps.get('frame', inheritedProps.get('data')).getIn(['rows', index, key]);
                        return applyScaledValue(dimensionName, customScale, value, inheritedProps.toObject());
                    };
                }

                // default getter just gets from scaledData via a index => dimensionName => key
                // the primitive dimension quirks have already been applied via applyScaledValue
                return (index: number, key: string): * => this.scaledData.getIn([index, dimensionName, key]);
            });

        // Build the customized scaled data for this child
        const scaledData = inheritedProps.get('frame', inheritedProps.get('data')).rows
            // map rows
            .map((row: ChartRow, index: number): List<Object> => {
                // then dimensions
                return  this.dimensions
                    .reduce((
                        flattenedDimensions: Map,
                        dimension: Map,
                        dimensionName: string
                    ): Map => {
                        // Get dimension info for current component
                        const appliedDimension = applyDimension(dimension, inheritedProps);
                        const columns = List([].concat(appliedDimension.get('columnName')));

                        // calculate new dimensions to add to dimension Map. In most cases this
                        // will be a single dimension (eg: x or y, etc) but if an array of columns
                        // is supplied then newDimensoins will be a map with a entry for each
                        // supplied column: eg: {x: 1, x0: 1, x2: 5, x3: 10}.
                        const newDimensions = columns.reduce((
                            newDimensions: Map<string, number>,
                            column: string,
                            dimensionIndex: number
                        ): Map<string, number> => {
                            const multiColumn = columns.size > 1;
                            const scaledValue = getters.get(dimensionName)(index, column);

                            // Always add the base dimension. This way components that don't know
                            // about x0, x1 etc will still work because x is still defined.
                            const withBaseDimension = dimensionIndex === 0
                                ? newDimensions.set(dimensionName, scaledValue)
                                : newDimensions;

                            // If there are multiple columns specified then set the extra dimension
                            // values with keys in the form `${dimensionName}${dimensionIndex}` - eg. x0
                            return multiColumn
                                ? withBaseDimension.set(`${dimensionName}${dimensionIndex}`, scaledValue)
                                : withBaseDimension;
                        }, Map());

                        return flattenedDimensions.merge(newDimensions);
                    }, Map())
                    .toObject();
            })
            .toArray();

        const scales = this.dimensions.mapEntries((entries: Array<any>): Array<any> => {
            const [dimensionName, dimension] = entries;
            const customScale = customScales.get(dimensionName);
            return [`${dimensionName}Scale`, customScale || dimension.get('scales').first()];
        }).toObject();

        return {
            ...inheritedProps.toObject(),
            ...scales,
            scaledData
        };
    }

    scaleChildren(children) {
        if(this.props.debug) console.log(this.props);
        const depth = 1;
        return mapChildren(children, (child) => {
            return this.getChildProps({
                ...child.props,
                chartType: child.type.chartType
            });
        }, depth);
    }

    render(): Element<any> {

        const {
            x, y, width, height,
            wrapper: WrapperComponent,
            wrapperProps
        } = this.props;

        const combinedWrapperProps = {
            ...wrapperProps,
            x, y, width, height
        };

        const scaledChildren = this.scaleChildren(this.props.children);

        //@TODO fix confusing duplicate naming...
        return <WrapperComponent {...combinedWrapperProps}>{scaledChildren}</WrapperComponent>;
    }
}

export default Wrapper;
