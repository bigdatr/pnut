// @flow

export default function zip<A,B>(a: Array<A>, b: Array<B>): Array<[A, B]> {
    return a.map((value, index) => [value, b[index]]);
}

