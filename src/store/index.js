if (!window['dva_react_hook_sotre']) {
   const inner = Symbol();
   const MODELS = {};
   const REFRESH_CACHE = {};
   const isDispatching = {
      dispatching: false,
      name: null
   };
   const dispatch_queue = {
      
   };
   let runtime_state = undefined;
   let REDUCER;
   let dispatch;
   window['dva_react_hook_sotre'] = {
      dispatch,
      inner,
      MODELS,
      REFRESH_CACHE,
      REDUCER,
      isDispatching,
      runtime_state,
      dispatch_queue
   };
};

const store = window['dva_react_hook_sotre'];

export default store;
