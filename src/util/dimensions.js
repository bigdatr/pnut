// @flow
export default function dimensions(pp = {}) {
    const {width = 0, height = 0, top = 0, bottom = 0, left = 0, right = 0} = pp;
    return {
        width: width - left - right,
        height: height - top - bottom,
        padding: {bottom, top, left, right}
    };
}
