// @flow

import React from 'react';
import {LineRenderable} from './LineRenderable';

export {LineRenderable as AreaRenderable};


/**
 *
 * @component
 *
 * Component used to render area charts. This component is just an alias for `Line` with
 * the `area` prop set to `true`
 * @name Area
 *
 * @example
 * <Area
 *     line={(props) => <path {...props.lineProps} strokeWidth={3}/>}
 *     curve={(curves) => curves.curveMonotoneX}
 * />
 */
export default class Area extends React.Component {
    static chartType = 'renderable';

    render(): React.Element<any> {
        return <LineRenderable
            area={true}
            {...this.props}
        />;
    }
}
