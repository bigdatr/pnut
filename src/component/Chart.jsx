// @flow
import React, {Component, Children, cloneElement} from 'react';
import Svg from './Svg';
import ChartData from '../chartdata/ChartData';
import applyDimension from '../util/applyDimension';
import applyScaledValue from '../util/applyScaledValue';
import applyPrimitiveDimensionProps from '../util/applyPrimitiveDimensionProps';
import defaultScale from '../util/defaultScale';
import SpruceClassName from 'stampy/lib/util/SpruceClassName';

import type {Node} from 'react';
import type {Element} from 'react';
import type {ChildrenArray} from 'react';
import type {ComponentType} from 'react';
import type {ChartRow} from '../definitions';


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

type Props<R> = {
    dimensions: Array<string>,
    height: number,
    width: number,
    padding: Array<number>,
    className: string,
    modifier: string,
    spruceName: string,
    wrapper: ComponentType<*>,
    wrapperProps: {[key: string]: mixed},
    childWrapper: ComponentType<*>,
    childWrapperProps: {[key: string]: mixed},
    childChart: Element<any>,
    children: ChildrenArray<Element<any>>,
    data: ChartData<R>,
    frame?: ChartData<R>
};

export type ChartDimensionList = Array<{dimensionName: string, dimension: ChartDimension}>;

export type ChartDimension = {
    columnKey: string,
    columns: Array<string>,
    scaleKey: string,
    scaleTypeKey: string,
    scaleUpdateKey: string,
    scales: Array<{column: string, scale: Function}>
};

class Chart<R: Object> extends Component<Props<R>> {
    dimensions: ChartDimensionList;
    scaledData: Array<{[key: string]: {[key: string]: number | string}}>;

    static chartType: string = 'canvas';

    static defaultProps = {
        dimensions: ['x','y'],
        wrapper: Svg,
        wrapperProps: {},
        childWrapper: Svg,
        childWrapperProps: {}
    }

    constructor(props: Props<R>) {
        super(props);

        this.dimensions = this.getDimensions(props);
        this.scaledData = this.getScaledData(props);
    }
    UNSAFE_componentWillReceiveProps(nextProps: Props<R>) {
        this.dimensions = this.getDimensions(nextProps);
        this.scaledData = this.getScaledData(nextProps);
    }
    getDimensions(
        props: Props<R>
    ): ChartDimensionList {

        // collect the children propTypes and merge chartType
        const childrenProps = Children.toArray(props.children)
            .filter((child: Element<any>) => child && child.props && child.type)
            .map((child): {[key: string]: *, chartType: string} => {
                // make each child inherit chart.props
                return {
                    ...props,
                    ...child.props,
                    chartType: child.type.chartType
                };
            });

        return props.dimensions.map((dimensionName: string) => {
            const columnKey = `${dimensionName}Column`;
            const scaleKey = `${dimensionName}Scale`;
            const scaleTypeKey = `${dimensionName}ScaleType`;
            const scaleUpdateKey = `${dimensionName}ScaleUpdate`;


            const columnsArray: Array<string> = childrenProps
                // concat default columns onto child columns
                .map((child): Array<string> => {
                    return [].concat(child[columnKey]).concat(props[columnKey]);
                })
                .reduce((rr, ii) => [...rr, ...ii], [])
                .filter(Boolean);

            const columns = [...new Set(columnsArray)];

            const dimension = {
                columnKey,
                columns,
                scaleKey,
                scaleTypeKey,
                scaleUpdateKey,
                scales: columns.map((column: string) => {
                    // eslint-disable-next-line no-unused-vars
                    const scaleUpdate = typeof props[scaleUpdateKey] === 'function' ? props[scaleUpdateKey] : (scale, props) => scale;
                    // to calculate the scale you need
                    // primitiveDimension (range)
                    // columns (domain)
                    // scaleType
                    // primitiveDimensionProps (range)
                    // data (domain)

                    // set(scaleUpdate(defaultScale, props))
                    return  {
                        column,
                        scale: scaleUpdate(
                            defaultScale({
                                primitiveDimension: dimensionName,
                                columns: columns,
                                scaleType: props[scaleTypeKey],
                                primitiveDimensionProps: applyPrimitiveDimensionProps(dimensionName, this.applyCanvasSize(props)),
                                data: props.data
                            }),
                            props
                        )
                    };
                })
            };

            // group children by their scaleGroup name (defaults to dimensionName)
            return {
                dimensionName,
                dimension
            };
        });
    }

    getScaledData(props: Props<R>): Array<{[key: string]: {[key: string]: number | string}}> {
        const data = props.frame || props.data;
        return data.rows.map((row: R): {[key: string]: {[key: string]: number | string}} => {
            return this.dimensions
                .reduce((
                    dimensionMap: {},
                    {dimension, dimensionName}
                ): {[key: string]: {[key: string]: number | string}} => {
                    return {
                        ...dimensionMap,
                        [dimensionName]: dimension.scales.reduce((
                            scaleMap: {},
                            {scale, column}
                        ): {[key: string]: number | string} => {
                            return {
                                ...scaleMap,
                                [column]: applyScaledValue(
                                    dimensionName,
                                    scale,
                                    row[column],
                                    this.applyCanvasSize(props)
                                )
                            };
                        }, {})
                    };
                }, {});
        });
    }
    applyCanvasSize = function applyCanvasSize<R: ChartRow>(props: Props<R>): Object {
        const {width, height, padding = []} = props;
        // $FlowBug: flow cant handle default assignment on array destructuring
        const [top = 0, right = 0, bottom = 0, left = 0] = padding;

        if(props.childChart) {
            return {
                ...props,
                width,
                height,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            };
        }

        return {
            ...props,
            width: Math.max(width - left - right, 0), // clamp negatives
            height: Math.max(height - top - bottom, 0), // clamp negatives
            outerWidth: width,
            outerHeight: height,
            top,
            right,
            bottom,
            left
        };
    }
    getChildProps(props: Props<R>): Object {
        const inheritedProps = this.applyCanvasSize({
            ...this.props,
            ...props
        });

        // Create custom scales from dimensions if required
        const customScales = this.dimensions
            .map(({dimension, dimensionName}): {dimensionName: string, scale: ?Function} => {
                const {scaleUpdate, scaleTypeName} = applyDimension(dimension, inheritedProps);

                // if child has defined either a custom scale or scaleType
                // we need to recreate the scale based on the custom props
                if(scaleUpdate || scaleTypeName) {
                    const scale = defaultScale({
                        primitiveDimension: dimensionName,
                        columns: dimension.columns,
                        scaleType: scaleTypeName,
                        primitiveDimensionProps: applyPrimitiveDimensionProps(dimensionName, inheritedProps),
                        data: inheritedProps.data
                    });

                    // if custom scale is a function pass the default scale through it.
                    return {
                        dimensionName,
                        scale: typeof scaleUpdate === 'function' ? scaleUpdate(scale.copy(), inheritedProps) : scale
                    };
                } else {
                    return {dimensionName, scale: null};
                }
            });


        // Create functions to get a value for each row for each dimension
        const getters: {[key: string]: Function} = this.dimensions
            .reduce((getMap: {}, {dimensionName}) => {
                const customScale = customScales.find(ii => ii.dimensionName === dimensionName);

                // If this dimension has a custom scale then use it rather than the pre-scaled data
                if(customScale && customScale.scale) {
                    const scale = customScale.scale;
                    return {
                        ...getMap,
                        [dimensionName]: (index: number, key: string): * => {
                            const value = (inheritedProps.frame || inheritedProps.data).rows[index][key];
                            return applyScaledValue(dimensionName, scale, value, inheritedProps);
                        }
                    };
                }

                // default getter just gets from scaledData via a index => dimensionName => key
                // the primitive dimension quirks have already been applied via applyScaledValue
                return {
                    ...getMap,
                    [dimensionName]: (index: number, key: string): * => this.scaledData[index][dimensionName][key]
                };
            }, {});

        // Build the customized scaled data for this child
        const scaledData = (inheritedProps.frame || inheritedProps.data).rows
            // map rows
            .map((row: R, index: number) => {
                // then dimensions
                return this.dimensions
                    .reduce((
                        flattenedDimensions: {},
                        {dimension, dimensionName}
                    ): {} => {
                        // Get dimension info for current component
                        const appliedDimension = applyDimension(dimension, inheritedProps);
                        const columnName = appliedDimension.columnName;
                        const columns: Array<string> = [].concat(columnName);

                        // calculate new dimensions to add to dimension Map. In most cases this
                        // will be a single dimension (eg: x or y, etc) but if an array of columns
                        // is supplied then newDimensoins will be a map with a entry for each
                        // supplied column: eg: {x: 1, x0: 1, x2: 5, x3: 10}.
                        const newDimensions = columns.reduce((newDimensions, column, dimensionIndex): {[key: string]: mixed} => {
                            const multiColumn = columns.length > 1;
                            const scaledValue = getters[dimensionName](index, column);

                            // Always add the base dimension. This way components that don't know
                            // about x0, x1 etc will still work because x is still defined.
                            const withBaseDimension = dimensionIndex === 0
                                ? {
                                    ...newDimensions,
                                    [dimensionName]: scaledValue
                                }
                                : newDimensions;

                            // If there are multiple columns specified then set the extra dimension
                            // values with keys in the form `${dimensionName}${dimensionIndex}` - eg. x0
                            return multiColumn
                                ? {
                                    ...withBaseDimension,
                                    [`${dimensionName}${dimensionIndex}`]: scaledValue
                                }
                                : withBaseDimension;
                        }, ({}: {[key: string]: mixed}));

                        return {
                            ...flattenedDimensions,
                            ...newDimensions
                        };
                    }, {});
            });

        const scaleProps = this.dimensions.reduce((result: {}, {dimension, dimensionName}): {} => {
            const customScale = customScales.find(ii => ii.dimensionName === dimensionName);
            return {
                ...result,
                [`${dimensionName}Scale`]: (customScale || {}).scale || (dimension.scales[0] || {}).scale
            };
        }, {});

        return {
            ...inheritedProps,
            scaledData,
            childChart: true,
            ...scaleProps
        };
    }
    render(): Node {
        const {width, height, outerWidth, outerHeight, top, left, stroke = 'black'} = this.applyCanvasSize(this.props);

        const {
            className,
            modifier,
            spruceName: name = 'PnutChart',
            wrapper: Wrapper,
            childWrapper: ChildWrapper,
            wrapperProps,
            childWrapperProps,
            childChart
        } = this.props;

        const combinedWrapperProps = {
            ...wrapperProps,
            stroke: stroke,
            className: SpruceClassName({name, modifier, className}),
            width: outerWidth,
            height: outerHeight
        };

        const combinedChildWrapperProps = {
            ...childWrapperProps,
            x: left,
            y: top,
            width: width,
            height: height
        };

        const scaledChildren = Children
            .toArray(this.props.children)
            .map((child: Element<any>): Element<any> => {
                return cloneElement(child, this.getChildProps({
                    ...child.props,
                    chartType: child.type.chartType
                }));
            });

        const chart = <ChildWrapper {...combinedChildWrapperProps}>{scaledChildren}</ChildWrapper>;


        if(childChart) {
            return chart;
        }

        return <Wrapper {...combinedWrapperProps}>{chart}</Wrapper>;
    }
}

export default Chart;
