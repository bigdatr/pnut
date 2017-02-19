// @flow

import React from 'react';
import {Map, List, Record} from 'immutable';

const Pointer = Record({
    id: null,
    type: null,
    fromStart: null,
    fromLast: null,
    x: null,
    y: null,
    clientX: null,
    clientY: null,
    screenX: null,
    screenY: null,
    radiusX: 0,
    radiusY: 0,
    force: 0,
    rotationAngle: 0,
    button: null,
    time: null
});


// Defaults for mouse wheel normalization
// @see https://github.com/basilfx/normalize-wheel/blob/master/src/normalizeWheel.js
const PIXEL_STEP  = 1;
const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

export class InteractionRenderable extends React.PureComponent {

    static propTypes = {
        height: React.PropTypes.number,
        width: React.PropTypes.number
    };

    static defaultProps = {
        clickMoveThreshold: 5,
        clickTimeThreshold: 100
    };

    constructor(props) {
        super(props);

        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
        this.handleMouseWheel = this.handleMouseWheel.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleWindowBlur = this.handleWindowBlur.bind(this);

        this.getPointer = this.getPointer.bind(this);
        this.addPointer = this.addPointer.bind(this);
        this.updatePointer = this.updatePointer.bind(this);
        this.removePointer = this.removePointer.bind(this);

        this.interactions = Map({
            pointers: Map(),
            keys: List()
        });
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('blur', this.handleWindowBlur);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('blur', this.handleWindowBlur);
    }


    handlePointerMove(ee) {
        const pointers = this.getPointersFromEvent(ee);
        pointers.forEach(this.updatePointer);

        if(this.props.onPointerMove) {
            this.props.onPointerMove(pointers, {
                event: ee,
                activePointers: this.interactions.get('pointers'),
                activeModifiers: this.interactions.get('keys')
            });
        }
    }

    handlePointerDown(ee) {
        ee.preventDefault();

        const pointers = this.getPointersFromEvent(ee);
        pointers.forEach(this.addPointer);

        if(this.props.onPointerDown) {
            this.onPointerDown(pointers, {
                event: ee,
                activePointers: this.interactions.get('pointers'),
                activeModifiers: this.interactions.get('keys')
            });
        }
    }

    handlePointerUp(ee) {
        ee.preventDefault();

        const pointers = this.getPointersFromEvent(ee);
        pointers.forEach(this.removePointer);

        const eventMeta = {
            event: ee,
            activePointers: this.interactions.get('pointers'),
            activeModifiers: this.interactions.get('keys')
        };

        if(this.props.onPointerUp) {
            this.props.onPointerUp(pointers, eventMeta);
        }

        if(this.props.onClick || this.props.onTap || true) {
            const clicks = pointers.filter(pointer => {
                const distanceMoved = Math.sqrt(Math.pow(pointer.dx, 2), Math.pow(pointer.dy, 2));
                const timeElapsed = pointer.dt;
                return distanceMoved <= this.props.clickMoveThreshold &&
                    timeElapsed <= this.props.clickTimeThreshold;
            });

            if(clicks.size === 0) return;

            if(this.props.onClick) this.props.onClick(clicks, eventMeta);
            if(this.props.onTap) this.props.onTap(clicks, eventMeta);
        }
    }


    handleMouseWheel(ee) {
        const modes = [PIXEL_STEP, LINE_HEIGHT, PAGE_HEIGHT];
        const multiplier = modes[ee.deltaMode];

        const dX = ee.deltaX * multiplier;
        const dY = ee.deltaY * multiplier;

        if(this.props.onMouseWheel) {
            this.props.onMouseWheel({dx, dy}, {event: ee});
        }

    }

    handleKeyUp(ee) {
        const allowedKeys = ['Meta', 'Alt', 'Control', 'Shift'];
        const key = ee.key || ee.keyIdentifier;
        if(allowedKeys.indexOf(key) === -1) return;

        const keyIndexToDelete = this.interactions.get('keys').indexOf(key);

        this.interactions = this.interactions.set(
            'keys',
            this.interactions.get('keys').delete(keyIndexToDelete)
        );

    }

    handleKeyDown(ee) {
        const allowedKeys = ['Meta', 'Alt', 'Control', 'Shift'];
        const key = ee.key || ee.keyIdentifier;
        if(allowedKeys.indexOf(key) === -1) return;

        this.interactions = this.interactions.set(
            'keys',
            this.interactions.get('keys').push(key)
        );
    }


    handleWindowBlur() {
        // Remove all currently pressed keys from array  because there is no way to know if they
        // are released if this window isn't focussed and it is prefereable to have them not
        // pressed than to have them stuck on.
        this.interactions = this.interactions.set('keys', List());
    }

    getPointersFromEvent(ee) {
        return ee.changedTouches
            ? List(Array.prototype.map.call(ee.changedTouches, this.getPointer))
            : List([this.getPointer(ee)]);
    }

    getPointerDeltas(lastPointer, pointer, deltaType) {
        if(!lastPointer) return Map({
            dx: 0,
            dy: 0,
            dt: 0,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0
        });

        const dx = pointer.x - lastPointer.x;
        const dy = pointer.y - lastPointer.y;
        const dt = pointer.time - lastPointer.time;

        const dtInSeconds = dt / 1000;

        const vx = dt ? dx / dtInSeconds : 0;
        const vy = dt ? dy / dtInSeconds : 0;

        const ax = (vx - lastPointer.getIn([deltaType, 'vx'])) / dtInSeconds;
        const ay = (vy - lastPointer.getIn([deltaType, 'vy'])) / dtInSeconds;

        return Map({dx,dy,dt,vx,vy,ax,ay});
    }

    getPointer(eventPointer) {
        const pointerId = this.getPointerId(eventPointer);
        const [x, y] = this.getCoordinates(eventPointer);

        const startPointer = this.interactions.getIn(['pointers', pointerId, 'start']);
        const lastPointer = this.interactions.getIn(['pointers', pointerId, 'last']);


        const newPointer = new Pointer({
            id: pointerId,
            type: pointerId.indexOf('touch') !== -1 ? 'touch' : 'mouse',
            time: Date.now(),
            x,
            y,
            clientX: eventPointer.clientX,
            clientY: eventPointer.clientY,
            screenX: eventPointer.screenX,
            screenY: eventPointer.screenY,
            radiusX: eventPointer.radiusX,
            radiusY: eventPointer.radiusY,
            force: eventPointer.force,
            rotationAngle: eventPointer.rotationAngle,
            button: eventPointer.button
        });
        return newPointer
            .set('fromStart', this.getPointerDeltas(startPointer, newPointer, 'fromStart'))
            .set('fromLast', this.getPointerDeltas(lastPointer, newPointer, 'fromLast'));
    }

    addPointer(pointer) {
        this.interactions = this.interactions.set(
            'pointers',
            this.interactions.get('pointers')
                .setIn([pointer.id, 'start'], pointer)
                .setIn([pointer.id, 'last'], pointer)
        );
    }

    updatePointer(pointer) {
        this.interactions = this.interactions.set(
            'pointers',
            this.interactions.get('pointers')
                .setIn([pointer.id, 'last'], pointer)
        );
    }

    removePointer(pointer) {
        this.interactions = this.interactions.set(
            'pointers',
            this.interactions.get('pointers').delete(pointer.id)
        );
    }

    getPointerId(pointer) {
        return typeof pointer.identifier !== 'undefined'
            ? `touch${pointer.identifier}`
            : 'mouse';
    }

    getCoordinates(pointer) {
        if(!this.box) return [0,0];
        const box = this.box.getBoundingClientRect();
        const xPos = pointer.clientX - box.left;
        const yPos = pointer.clientY - box.top;
        return [xPos, yPos];
    }


    render(): React.Element<any> {
        console.log(this.props);
        return <g
            ref={(elem) => this.box = elem}
            onMouseMove={this.handlePointerMove}
            onTouchMove={this.handlePointerMove}

            onMouseDown={this.handlePointerDown}
            onTouchStart={this.handlePointerDown}

            onMouseUp={this.handlePointerUp}
            onTouchEnd={this.handlePointerUp}

            onWheel={this.handleMouseWheel}

            onKeyDown={this.handleKeyDown}
            onKeyUp={this.handleKeyUp}
        >
            <rect
                x={0}
                y={0}
                width={this.props.width}
                height={this.props.height}
                stroke='none'
                fill='rgba(0,0,0,0)'
            ></rect>
        </g>;
    }
}

export default class Interaction extends React.Component {
    static chartType = 'interactive';
    render(): React.Element<any> {
        return <InteractionRenderable {...this.props} />;
    }
}

