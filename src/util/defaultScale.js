// @flow
import createScale from './createScale';

export default function defaultScale(scaleProps: Object): Function {
    const {
        primitiveDimension,
        columns,
        scaleType,
        primitiveDimensionProps,
        data
    } = scaleProps;


    switch(primitiveDimension) {
        case 'x':
        case 'y':

            // choose the max value of range based on x/width y/height
            var bound = (primitiveDimension === 'x') ? primitiveDimensionProps.width : primitiveDimensionProps.height;

            return createScale({
                data,
                columns,
                scaleType,
                upperBound: bound
            });

        default:
            return createScale({data, columns, scaleType});
    }
}
