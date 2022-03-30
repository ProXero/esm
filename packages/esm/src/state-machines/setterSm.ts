
const setterSm = (initialValue) => ({
    value: initialValue,
    stateTransitions: {
        set: (a) => (state) => a
    }
});

export default setterSm;