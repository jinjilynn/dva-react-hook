if (!window['dva_react_hook_sotre']) {
   const inner = Symbol();
   const MODELS = {};
   const REFRESH_CACHE = {};
   let runtime_state = undefined;
   let REDUCER;
   let dispatch;
   window['dva_react_hook_sotre'] = {
      dispatch,
      inner,
      MODELS,
      REFRESH_CACHE,
      REDUCER,
      isDispatching: false,
      runtime_state
   };
};

const store = window['dva_react_hook_sotre'];

export default store;
