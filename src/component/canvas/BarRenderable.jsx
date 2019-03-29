// @flow

import React from 'react';
import {ColumnRenderable} from './ColumnRenderable';
import type {Node} from 'react';
export {ColumnRenderable as BarRenderable};


/**
 *
 * @component
 *
 * Component used to render bar charts. This component is just an alias for `Column`
 * @name Bar
 *
 * @example
 * <Bar
 *     column={(props) => <rect {...props.columnProps} fill='blue'/>}
 * />
 */
export default class Bar extends React.Component<*> {
    static chartType = 'canvas';

    render(): Node {
        return <ColumnRenderable
            {...this.props}
        />;
    }
}
