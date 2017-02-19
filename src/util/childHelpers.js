import {cloneElement, Children} from 'react';


export function mapChildren(children, propMapper, depth=-1, props={}) {
    const result = Children
        .toArray(children)
        .map((child) => {
            const type = child.type.chartType;
            switch(type) {
                case 'renderable':
                    return cloneElement(child, propMapper(child));
                case 'transparentWrapper':
                    return cloneElement(child, {
                        ...props,
                        chartType: type,
                        ...propMapper(child),
                        children: mapChildren(child.props.children, propMapper, depth - 1 < 0 ? 0 : depth - 1, {...props, ...propMapper(child)})
                    });
                case 'wrapper':
                    return depth
                        ? cloneElement(child, {
                            ...props,
                            chartType: type,
                            ...propMapper(child),
                            children: mapChildren(child.props.children, propMapper, depth - 1, {...props, ...propMapper(child)})
                        })
                        : cloneElement(child, {
                            ...props,
                            chartType: type,
                            ...propMapper(child)
                        });

                default:
                    console.warn(`warning: unknown child of type: ${type}`);
                    return null;
            }
        });

        return result;
}


export function flattenRenderableChildren(children, depth=-1) {
    return Children
        .toArray(children)
        .reduce((result, child) => {
            const type = child.type.chartType;

            switch(type) {
                case 'renderable':
                    return result.concat(child);
                case 'transparentWrapper':
                    return result.concat(flattenRenderableChildren(child.props.children, depth - 1));
                case 'wrapper':
                    return depth
                        ? result.concat(flattenRenderableChildren(child.props.children, depth - 1))
                        : result;

                default:
                    console.warn(`warning: unknown child of type: ${type}`);
                    return null;
            }

        }, []);
}