import {cloneElement, Children} from 'react';


export function mapChildren(children, propMapper) {
    const result = Children
        .toArray(children)
        .map((child) => {
            const type = child.type.chartType;
            switch(type) {
                case 'renderable':
                case 'wrapper':
                    return cloneElement(child, {
                        chartType: type,
                        ...propMapper(child)
                    });
                case 'transparentWrapper':
                    return cloneElement(child, {
                        chartType: type,
                        ...propMapper(child),
                        children: mapChildren(child.props.children, propMapper)
                    });
                default:
                    console.warn(`warning: unknown child of type: ${type}`);
                    return null;
            }
        });

        return result;
}


export function flattenRenderableChildren(children) {
    return Children
        .toArray(children)
        .reduce((result, child) => {
            const type = child.type.chartType;
            switch(type) {
                case 'renderable':
                case 'wrapper':
                    return result.concat(child);
                case 'transparentWrapper':
                    return result.concat(flattenRenderableChildren(child.props.children));
                default:
                    console.warn(`warning: unknown child of type: ${type}`);
                    return null;
            }
        }, []);
}