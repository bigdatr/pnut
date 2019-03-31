// @flow

import React from 'react';
import {LineRenderable} from './LineRenderable';
import type {Node} from 'react';
export {LineRenderable as AreaRenderable};


export default class Area extends React.Component<*> {
    static chartType = 'canvas';

    render(): Node {
        return <LineRenderable
            area={true}
            {...this.props}
        />;
    }
}
