// @flow
//
export default function applyPrimitiveDimensionProps(dimensionName: string, props: Object): Object {
    switch (dimensionName) {
        case 'x':
        case 'y':
            return {
                width: props.width,
                height: props.height
            };

        default:
            return {};
    }
}
