// @flow
import React from 'react';
import type {Node} from 'react';

type PointerData = {
    id: string,
    type: string,
    fromStart: PointerDeltas,
    fromLast: PointerDeltas,
    x: number,
    y: number,
    clientX: number,
    clientY: number,
    screenX: number,
    screenY: number,
    button: ?number,
    time: number
};

type PointerDeltas = {dx: number, dy: number, dt: number, vx: number, vy: number, ax: number, ay: number};

class Pointer {
    id: string;
    type: string;
    fromStart: PointerDeltas;
    fromLast: PointerDeltas;
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
    button: ?number;
    time: number;

    constructor(pointerData: PointerData) {
        this.id = pointerData.id;
        this.type = pointerData.type;
        this.fromStart = pointerData.fromStart;
        this.fromLast = pointerData.fromLast;
        this.x = pointerData.x;
        this.y = pointerData.y;
        this.clientX = pointerData.clientX;
        this.clientY = pointerData.clientY;
        this.screenX = pointerData.screenX;
        this.screenY = pointerData.screenY;
        this.button = pointerData.button;
        this.time = pointerData.time;
    }
}

type Interactions = {
    pointers: {[key: string]: {start: Pointer, last: Pointer}},
    keys: Array<string>
};

type PointerHandler = (pointers: Array<Pointer>, interactions: Interactions, event: MouseEvent | TouchEvent) => void;

type Props = {
    width: number,
    height: number,
    clickMoveThreshold: number,
    clickTimeThreshold: number,
    onPointerMove?: PointerHandler,
    onPointerDown?: PointerHandler,
    onPointerUp?: PointerHandler,
    onClick?: PointerHandler,
    onTap?: PointerHandler,
    onMouseWheel?: (change: {dx: number, dy: number}, event: WheelEvent) => void
};


// Defaults for mouse wheel normalization
// @see https://github.com/basilfx/normalize-wheel/blob/master/src/normalizeWheel.js
const PIXEL_STEP  = 1;
const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

export default class InteractionLayer extends React.PureComponent<Props> {

    static defaultProps = {
        clickMoveThreshold: 5,
        clickTimeThreshold: 100
    };

    interactions: Interactions;

    box: ?Element;

    constructor(props: Props) {
        super(props);

        this.interactions = {
            pointers: {},
            keys: []
        };
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


    handlePointerMove = (ee: MouseEvent | TouchEvent) => {
        const pointers = this.getPointersFromEvent(ee);
        pointers.forEach(this.updatePointer);

        if(this.props.onPointerMove) {
            this.props.onPointerMove(pointers, this.interactions, ee);
        }
    }

    handlePointerDown = (ee: MouseEvent | TouchEvent) => {
        ee.preventDefault();

        const pointers = this.getPointersFromEvent(ee);
        pointers.forEach(this.addPointer);

        if(this.props.onPointerDown) {
            this.props.onPointerDown(pointers, this.interactions, ee);
        }
    }

    handlePointerUp = (ee: MouseEvent | TouchEvent) => {
        ee.preventDefault();

        const pointers = this.getPointersFromEvent(ee);
        pointers.forEach(this.removePointer);

        if(this.props.onPointerUp) {
            this.props.onPointerUp(pointers, this.interactions, ee);
        }

        if(this.props.onClick || this.props.onTap) {
            const clicks = pointers.filter(pointer => {
                const distanceMoved = Math.sqrt(
                    Math.pow(pointer.fromStart.dx, 2) +
                    Math.pow(pointer.fromStart.dy, 2)
                );
                const timeElapsed = pointer.fromStart.dt;
                return distanceMoved <= this.props.clickMoveThreshold &&
                    timeElapsed <= this.props.clickTimeThreshold;
            });

            if(clicks.length === 0) return;

            if(this.props.onClick) this.props.onClick(clicks, this.interactions, ee);
            if(this.props.onTap) this.props.onTap(clicks, this.interactions, ee);
        }
    }


    handleMouseWheel = (ee: WheelEvent) => {
        const modes = [PIXEL_STEP, LINE_HEIGHT, PAGE_HEIGHT];
        const multiplier = modes[ee.deltaMode];

        const dx = ee.deltaX * multiplier;
        const dy = ee.deltaY * multiplier;

        if(this.props.onMouseWheel) {
            this.props.onMouseWheel({dx, dy}, ee);
        }

    }

    handleKeyUp = (ee: KeyboardEvent) => {
        const allowedKeys = ['Meta', 'Alt', 'Control', 'Shift'];
        const key = ee.key;
        if(allowedKeys.indexOf(key) === -1) return;
        const keyIndexToDelete = this.interactions.keys.indexOf(key);
        this.interactions.keys.splice(keyIndexToDelete, 1);
    }

    handleKeyDown = (ee: KeyboardEvent) => {
        const allowedKeys = ['Meta', 'Alt', 'Control', 'Shift'];
        const key = ee.key;
        if(allowedKeys.indexOf(key) === -1) return;
        this.interactions.keys.push(key);
    }


    handleWindowBlur = () => {
        // Remove all currently pressed keys from array  because there is no way to know if they
        // are released if this window isn't focussed and it is prefereable to have them not
        // pressed than to have them stuck on.
        this.interactions.keys = [];
    }

    getPointersFromEvent(ee: MouseEvent | TouchEvent): Array<Pointer> {
        return ee instanceof TouchEvent
            ? Array.prototype.map.call(ee.changedTouches, this.getPointer)
            : [this.getPointer(ee)];
    }

    getPointerDeltas(
        lastPointer: ?Pointer,
        pointerData: {x: number, y: number, time: number},
        lastDeltas: ?PointerDeltas
    ): PointerDeltas {
        if(!lastPointer || !lastDeltas) return {
            dx: 0,
            dy: 0,
            dt: 0,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0
        };

        const dx = pointerData.x - lastPointer.x;
        const dy = pointerData.y - lastPointer.y;
        const dt = pointerData.time - lastPointer.time;

        const dtInSeconds = dt / 1000;

        const vx = dt ? dx / dtInSeconds : 0;
        const vy = dt ? dy / dtInSeconds : 0;

        const ax = (vx - lastDeltas.vx) / dtInSeconds;
        const ay = (vy - lastDeltas.vy) / dtInSeconds;

        return {dx,dy,dt,vx,vy,ax,ay};
    }

    getPointer(eventPointer: Touch | MouseEvent) {
        const pointerId = this.getPointerId(eventPointer);
        const [x, y] = this.getCoordinates(eventPointer);

        const pointerData = this.interactions.pointers[pointerId];
        const lastPointer = pointerData && pointerData.last;
        const startPointer = pointerData && pointerData.start;
        const time = Date.now();
        return new Pointer({
            id: pointerId,
            type: pointerId.indexOf('touch') !== -1 ? 'touch' : 'mouse',
            time,
            x,
            y,
            clientX: eventPointer.clientX,
            clientY: eventPointer.clientY,
            screenX: eventPointer.screenX,
            screenY: eventPointer.screenY,
            button: eventPointer instanceof MouseEvent ? eventPointer.button : null,
            fromStart: this.getPointerDeltas(startPointer, {x, y, time}, (startPointer || {}).fromStart),
            fromLast: this.getPointerDeltas(lastPointer, {x, y, time}, (lastPointer || {}).fromLast)
        });

    }

    addPointer = (pointer: Pointer) => {
        this.interactions.pointers[pointer.id] = {
            start: pointer,
            last: pointer
        };
    }

    updatePointer = (pointer: Pointer) => {
        this.interactions.pointers[pointer.id] = this.interactions.pointers[pointer.id] || {};
        this.interactions.pointers[pointer.id].last = pointer;
    }

    removePointer = (pointer: Pointer) => {
        delete this.interactions.pointers[pointer.id];
    }

    getPointerId(eventPointer: Touch | MouseEvent) {
        return typeof eventPointer.identifier === 'number'
            ? `touch${eventPointer.identifier}`
            : 'mouse';
    }

    getCoordinates(eventPointer: Touch | MouseEvent) {
        if(!this.box) return [0,0];
        const box = this.box.getBoundingClientRect();
        const xPos = eventPointer.clientX - box.left;
        const yPos = eventPointer.clientY - box.top;
        return [xPos, yPos];
    }


    render(): Node {

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