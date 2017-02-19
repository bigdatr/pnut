import Wrapper from './Wrapper';
import React, {Component, Children, cloneElement, Element, PropTypes} from 'react';
import {mapChildren, flattenRenderableChildren} from '../util/childHelpers';

const duration = 500;

//@TODO rename to Animate/AnimationWrapper
class Animation extends Component {
    static chartType = 'transparentWrapper';

    constructor(props) {
        super(props);

        this.state = {
            animations: this.getAnimationsFromChildren(props.children)
        };

        this.tick = this.tick.bind(this);
    }


    getAnimationsFromChildren(children) {
        const depth = 0;

        return flattenRenderableChildren(children, depth).reduce((result, child) => {
            if(!child.props.id) return result;
            result[child.props.id] = {
                current: child.props.scaledData,
                initial: child.props.scaledData
            };
            return result;
        }, {});
    }


    componentDidMount() {
        this.tick();
    }

    tick() {
        this.interpolate();
        window.requestAnimationFrame(this.tick);
    }

    interpolate() {
        this.setState({
            animations: Object.keys(this.state.animations)
                .reduce((result, id) => {
                    if(!result[id].target) return result;

                    result[id].current = this.interpolateValues(
                        result[id].initial,
                        result[id].target,
                        result[id].current,
                        result[id].start,
                        Date.now()
                    );

                    return result;
                }, this.state.animations)
        });
    }

    interpolateValues(initial, target, current, start, now) {
        const complete = (now - start) / duration;
        if(complete >= 1) return target;

        const interpolated = initial.map((row, index) => {
            const keys = Object.keys(row);
            return keys.reduce((result, key) => {
                result[key] = initial[index][key] + ((target[index][key] - initial[index][key]) * complete);
                return result;
            }, {});
        });

        return interpolated;
    }


    // lotsa mutation here for performance
    componentWillReceiveProps(nextProps) {
        this.setState({
            animations: nextProps.children.reduce((result, child) => {
                const data = child.props.scaledData;
                const id = child.props.id;
                if(!id) return result;

                result[id] = result[id] || {};

                if(!result[id].current) {
                    result[id].current = data;
                    result[id].initial = data;
                    return result;
                }

                result[id].target = data;
                result[id].start = Date.now();

                return result;

            }, this.state.animations)
        });
    }

    applyAnimationsToChildren(children) {
        const depth = 0;

        return mapChildren(children, (child) => {
            // @TODO unnecessary cloning here...
            if(child.props.chartType !== 'renderable') return child.props;

            return {
                ...child.props,
                scaledData: this.state.animations[child.props.id]
                    ? this.state.animations[child.props.id].current
                    : child.props.scaledData
            };
        }, depth);
    }

    render() {
        return <g>{this.applyAnimationsToChildren(this.props.children)}</g>;
    }
}

// @TODO reduce number of wrappers
class AnimationWrapper extends Component {
    static chartType = 'wrapper';
    render() {
        return <Wrapper
            {...this.props}
        >
            <Animation>
                {this.props.children}
            </Animation>
        </Wrapper>;
    }
}

export default Animation;