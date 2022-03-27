import { esmFactory } from "./main";


test('sdf', () => {
    let state =  {};
    const setState = (mod) => (state = mod(state));
    const f = esmFactory(setState);
    expect(1).toBe(2-1);
});