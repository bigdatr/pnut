import React, {Component, Children, cloneElement, Element, PropTypes} from 'react';
import {mapChildren, flattenRenderableChildren} from '../util/childHelpers';
import InteractionCapture from './canvas/InteractionRenderable';

class Interaction extends Component {
    static chartType = 'transparentWrapper';

    constructor(props) {
        super(props);
        this.state = {
            interactionData: {
                foo: 'bar'
            }
        };
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseWheel = this.handleMouseWheel.bind(this);
    }


    handlePointerMove() {
        // console.log(arguments);
    }

    handlePointerUp() {
        // console.log(arguments);
    }

    handleClick() {
        // console.log(arguments);
    }

    handleMouseWheel() {
        // console.log(arguments);
    }



    render() {
        return <g>
            {
                this.props.interactionData
                    ? null
                    : <InteractionCapture
                        onPointerMove={this.handlePointerMove}
                        onPointerUp={this.handlePointerUp}
                        onClick={this.handleClick}
                        onMouseWheel={this.handleMouseWheel}
                        width={this.props.width}
                        height={this.props.height}
                    />
            }

            {mapChildren(this.props.children, (child) => {
                return {
                    interactionData: this.state.interactionData,
                    ...child.props
                };
            })}
        </g>;
    }
}

export default Interaction;