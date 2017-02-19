// @flow

import React from 'react';
import {ColumnRenderable} from './ColumnRenderable';

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
export default class Bar extends React.Component {
    static chartType = 'renderable';

    render(): React.Element<any> {
        return <ColumnRenderable
            {...this.props}
        />;
    }
}
