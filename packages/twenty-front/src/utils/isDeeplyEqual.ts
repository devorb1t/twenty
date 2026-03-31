import fastDeepEqual from 'fast-deep-equal';

export const isDeeplyEqual = <T>(a: T, b: T) => fastDeepEqual(a, b);
