
export type Updater<T> = (prev: T) => T;
export type Setter<T> = (upd: Updater<T>) => void;

export const esmFactory = <T>(setter: Setter<T>) => {

};