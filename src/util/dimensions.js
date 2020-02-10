// @flow
type DimensionConfig = {
    width?: number,
    height?: number,
    top?: number,
    left?: number,
    right?: number,
    bottom?: number
};

export default function dimensions(pp: DimensionConfig = {}) {
    const {width = 0, height = 0, top = 0, bottom = 0, left = 0, right = 0} = pp;

    const innerWidth = width - left - right;
    const innerHeight = height - top - bottom;
    return {
        width: innerWidth,
        height: innerHeight,
        padding: {bottom, top, left, right},
        xRange: [0, innerWidth],
        yRange: [innerHeight, 0]
    };
}
