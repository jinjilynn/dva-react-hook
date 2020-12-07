import store from '../store';

export default function createStore(reducer, preloadedState, initfun) {
    if (typeof reducer !== 'function') {
        throw new Error('Expected the reducer to be a function.')
    }

    if (typeof initfun === 'function') {
        if (typeof preloadedState !== 'undefined') {
            initfun(preloadedState);
        }
    }

    !store.REDUCER && (store.REDUCER = reducer);

    function dispatch(action) {
        if (!action) {
            throw new Error(
                'Actions must be plain objects. ' +
                'Use custom middleware for async actions.'
            )
        }

        if (typeof action.type === 'undefined') {
            throw new Error(
                'Actions may not have an undefined "type" property. ' +
                'Have you misspelled a constant?'
            )
        }

        if (store.isDispatching) {
            throw new Error('may not dispatch actions')
        }

        try {
            store.isDispatching = true
            store.REDUCER(store.runtime_state, action)
        } finally {
            store.isDispatching = false
        }
    }
    !store.dispatch && (store.dispatch = dispatch);
    return [store.runtime_state, dispatch];
}