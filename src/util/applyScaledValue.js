// @flow

function halfBandwidth(scale: Function): number {
    if(scale.bandwidth) {
        return scale.bandwidth() / 2;
    }
    return 0;
}


/**
 * applyScaledValue
 *
 * Because primitive dimensions correlate to an onScreen pixel value the need
 * a slightly different calculation when applying the scale. This is abstracted away
 * to save the headache of knowing to recaclulate.
 */
export default function applyScaledValue(dimensionName: string, scale: Function, value: *, props: Object): * {
    if(value === null) {
        return value;
    }

    switch (dimensionName) {
        case 'x':
            return scale(value) + halfBandwidth(scale);

        case 'y':
            return props.height - (scale(value) + halfBandwidth(scale));

        default:
            // the default behavior is to apply current column through current scale
            return scale(value);
    }
}
