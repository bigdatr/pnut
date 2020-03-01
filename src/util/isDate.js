// @flow
export default function isDate(value: any): boolean {
    return value instanceof Date && !isNaN(value.getTime());
}
