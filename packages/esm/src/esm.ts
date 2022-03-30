import { lensProp, mapObjIndexed, omit, over } from "ramda";

export function esm(stateMachineDef, setter) {
    let localState;

    function updateState(modFunc) {
        setter((prevState) => {
            const result = modFunc(prevState);
            localState = result;
            return result;
        })
    }

    function getStateObjects(stateMachineDef) {
        return omit(['stateTransitions', 'combiners'], stateMachineDef);
    }

    function getDefaultValue(smDef, key) {
        if (key === 'value') {
            return smDef;
        }
        if (smDef.hasOwnProperty('value')) {
            return smDef.value;
        }
        
        const res = mapObjIndexed(getDefaultValue, getStateObjects(smDef));
        return res;
    }

    function initDefaultStateValue() {
        updateState(() => getDefaultValue(getStateObjects(stateMachineDef), ''));
    }

    initDefaultStateValue();

    const innerStateMachineDefs = mapStateMachineDefs(getStateObjects(stateMachineDef));
    const transitions = mapTransitions(stateMachineDef?.stateTransitions || []);

    function mapTransitions(transitions) {
        return mapObjIndexed((f: (...args: any[]) => any) => {
            return (...args: any[]) => {
                updateState(f(...args))
            };
        }, transitions)
    }

    function mapCombiners(combiners) {
        return mapObjIndexed((f: (...args: any[]) => any) => {
            return (...args) => f(...args)({transitions: {...transitions, ...innerStateMachineDefs}, state: localState});
        }, combiners)
    }

    function mapStateMachineDefs(stateMachineDefs) {
        return mapObjIndexed((smDef, key: string) => {
            const lens = lensProp<any, any>(key);
            return esm(smDef, (f: any) => updateState(over(lens, f)));
        }, omit(['value'], stateMachineDefs))
    }

    return {
        ...innerStateMachineDefs,
        ...transitions,
        ...mapCombiners(stateMachineDef.combiners)
    };
}
