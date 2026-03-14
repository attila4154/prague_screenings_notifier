export type Result<T, E = Error> = [E, null] | [null, T];

