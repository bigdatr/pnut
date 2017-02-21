// @flow

export default function memoize(storage: Object): Function {
    return function memoizer(key: string, fn: Function): * {
        if(storage.hasOwnProperty(key)) {
            return storage[key];
        }
        const value: * = fn();
        storage[key] = value;
        return value;
    };
}
