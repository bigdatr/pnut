// @flow
import React, {Component, PropTypes} from 'react';
import Svg from './Svg';
import SpruceClassName from 'stampy/lib/util/SpruceClassName';
import Wrapper from './Wrapper';

class Chart extends Component {
    chartType: string;
    applyCanvasSize: Function;

    static propTypes = {

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
        dimensions: ['x','y'],
        wrapper: Svg,
        wrapperProps: {}
    }

    applyCanvasSize(props: Object): Object {
        const {width, height, padding = []} = props;
        // $FlowBug: flow cant handle default assignment on array destructuring
        const [top = 0, right = 0, bottom = 0, left = 0] = padding;

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

    render(): Element<any> {
        const {
            width,
            height,
            outerWidth,
            outerHeight,
            top,
            left
        } = this.applyCanvasSize(this.props);

        const {
            className,
            modifier,
            spruceName: name = 'PnutChart',
            wrapper: OuterWrapper,
            wrapperProps,
            childWrapperProps,
            childWrapper,
            ...rest
        } = this.props;

        const combinedOuterWrapperProps = {
            ...wrapperProps,
            stroke: 'black',
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

        return <OuterWrapper {...combinedOuterWrapperProps}>
            <Wrapper
                {...combinedChildWrapperProps}
                wrapper={childWrapper}
                {...rest}
            >
                {this.props.children}
            </Wrapper>
        </OuterWrapper>;
    }
}

export default Chart;
