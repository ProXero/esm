import {esm} from "./esm";
import { setterSm } from "./state-machines";

describe('sm defition with primitive state machines', () => {
    let state;
    const setter = (mod) => state = mod(state);
    
    const stateMachineDef = {
        counter: setterSm(0),
        text: setterSm(''),
        combined: setterSm({}),
        stateTransitions: {
            fillCombined: () => (state) => ({...state, combined: {counter: state.counter, text: state.text}})
        },
        combiners: {
            reset: () => ({transitions}) => {
                transitions.counter.set(0);
                transitions.text.set('');
                transitions.combined.set({})
            }
        }
    }

    test('intializes value', () => {
        const f = esm(stateMachineDef, setter);
        expect(state).toEqual({
            counter: 0,
            text: '',
            combined: {}
        });
    });

    test('inner state transitions work', () => {
        const f = esm(stateMachineDef, setter);
        f.counter.set(100);
        expect(state).toEqual({
            counter: 100,
            text: '',
            combined: {}
        });
    });

    test('outer state transition can change state', () => {
        const f = esm(stateMachineDef, setter);
        expect(state).toEqual({
            counter: 0,
            text: '',
            combined: {}
        });
  
        f.counter.set(100);
        f.text.set('one');
        f.fillCombined();
  
        expect(state).toEqual({
            counter: 100,
            text: 'one',
            combined: {
                counter: 100,
                text: 'one'
            }
        });
    });

    test('combiners can use inner transitions', () => {
        const f = esm(stateMachineDef, setter);
        expect(state).toEqual({
            counter: 0,
            text: '',
            combined: {}
        });
  
        f.counter.set(100);
        f.text.set('one');
        f.fillCombined();
        f.reset();

        expect(state).toEqual({
            counter: 0,
            text: '',
            combined: {}
        });
    });


})