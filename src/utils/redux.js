
async function loop_dispatch(store) {
    while (true) {
        if (!store.isDispatching.dispatching) {
            store.isDispatching.dispatching = true;
            const keys = Object.keys(store.dispatch_queue);
            keys.forEach(it => {
                store.isDispatching.name = it.split('_')[0].split('/')[0];
                store.REDUCER(store.runtime_state, store.dispatch_queue[it]);
                delete store.dispatch_queue[it];
            });
            store.isDispatching.dispatching = false;
            store.isDispatching.name = null;
        }
        await new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }
}

function dispatch(action) {
    const store = this;
    if(!store){
        throw new Error('strange!! there is no store in dispatch of utils, please issue it.');
    }
    if (!action) {
        throw new Error(
            'Actions must be plain objects. '
        )
    }

    if (typeof action.type === 'undefined') {
        throw new Error(
            'Actions may not have an undefined "type" property.'
        )
    }

    if (store.isDispatching.dispatching) {
        action.temp_id = `${action.name}_${(Math.random() * Math.random()).toString().replace(/\./g, '')}`;
        store.dispatch_queue[action.temp_id] = action;
    }

    try {
        store.isDispatching.dispatching = true;
        store.isDispatching.name = action.name.split('/')[0];
        store.REDUCER(store.runtime_state, action)
    } finally {
        store.isDispatching.dispatching = false;
        store.isDispatching.name = null;
    }
}

function initfun($i, store) {
    if ($i && typeof $i == 'object' && !Array.isArray($i)) {
        const keys = Object.keys($i);
        if (keys.length > 0) {
            store.runtime_state = Object.assign($i, store.runtime_state);
        }
    }
}

export default function createStore(reducer, preloadedState, store) {
    if (typeof reducer !== 'function') {
        throw new Error('Expected the reducer to be a function.')
    }
    if (typeof preloadedState !== 'undefined') {
        initfun(preloadedState, store);
    }
    !store.REDUCER && (store.REDUCER = reducer.bind(store));
    !store.dispatch && (store.dispatch = dispatch.bind(store));
    loop_dispatch(store);
    return [store.runtime_state, store.dispatch];
}