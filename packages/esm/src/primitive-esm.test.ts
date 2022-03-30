import { append } from "ramda";
import {esm} from "./esm";

describe('primitive state', () => {
    let state = 0;
    const setter = (mod) => state = mod(state);
    
    const stateMachineDef = {
        value: 10,
        stateTransitions: {
            set: (num) => () => num
        }
    }

    test('intializes value', () => {
        const f = esm(stateMachineDef, setter);
        expect(state).toBe(10);
    });

    test('state transition can modify state', () => {
        const f = esm(stateMachineDef, setter);
        f.set(100);
        expect(state).toBe(100);
    });
})

describe('primitive state with object value', () => {
    let state = {
        name: 'John',
        age: 20
    };
    const setter = (mod) => state = mod(state);
    
    const stateMachineDef = {
        value: {
            name: 'Jim',
            age: 10
        },
        stateTransitions: {
            set: (obj) => () => obj,
            setAge: (num) => (prev) => ({...prev, age: num})
        }
    }

    test('intializes value', () => {
        const f = esm(stateMachineDef, setter);
        expect(state).toEqual({
            name: 'Jim',
            age: 10
        });
    });

    test('state transition can modify state', () => {
        const f = esm(stateMachineDef, setter);
        const max = {
            name: 'Max',
            age: 100
        };
        f.set(max);
        expect(state).toEqual(max);
    });

    test('state transition partial update', () => {
        const f = esm(stateMachineDef, setter);
        f.setAge(30);
        expect(state).toEqual({
            name: 'Jim',
            age: 30
        });
    });
})


describe('primitive state with combiners', () => {
    let state = {
        todos: [],
        lastTodo: undefined
    };
    const setter = (mod) => state = mod(state);
    
    const stateMachineDef = {
        value: {
            todos: [],
            lastTodo: undefined
        },
        stateTransitions: {
            addTodo: (obj) => (prev) => ({...prev, todos: append(obj, prev.todos)}),
            setLastTodo: (obj) => (prev) => ({...prev, lastTodo: obj})
        },
        combiners: {
            addTodoWithSave: (obj) => ({transitions}) => {
                transitions.addTodo(obj);
                transitions.setLastTodo(obj);
            },
            addTodos: (todos) => ({transitions}) => {
                todos.forEach(element => {
                    transitions.addTodo(element);
                });
            },
            updateLastTodo: () => ({transitions, state}) => {
                transitions.setLastTodo(state.todos[state.todos.length-1]);
            },
            asyncAdd: (promise) => async ({transitions}) => {
                transitions.addTodo(await promise);
            }
        }
    }

    test('combined two partial updates', () => {
        const f = esm(stateMachineDef, setter);
        const todo = {text: 'something'};
        f.addTodoWithSave(todo);

        expect(state).toEqual({
            todos: [todo],
            lastTodo: todo
        });
    });

    test('call addTodo for list', () => {
        const f = esm(stateMachineDef, setter);
        const todos = [{text: 'something'}, {text: 'something else'}, {text: 'other things'}];
        f.addTodos(todos);

        expect(state).toEqual({
            todos: todos,
            lastTodo: undefined
        });
    });

    test('async combiner', async () => {
        const f = esm(stateMachineDef, setter);
        const todo = {text: 'something else'};
        const p = f.asyncAdd(Promise.resolve(todo));
        expect(state).toEqual({
            todos: [],
            lastTodo: undefined
        });

        await p;
        expect(state).toEqual({
            todos: [todo],
            lastTodo: undefined
        });
    });

    test('combiner using state', async () => {
        const f = esm(stateMachineDef, setter);
        const todos = [{text: 'something else'}, {text: 'do it'}];
        f.addTodos(todos);
        expect(state).toEqual({
            todos,
            lastTodo: undefined
        });

        f.updateLastTodo();
        expect(state).toEqual({
            todos: todos,
            lastTodo: todos[1]
        });
    });
})
