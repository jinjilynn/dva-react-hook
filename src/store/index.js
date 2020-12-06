import React from 'react'

if (!window['dva_react_hook_sotre']) {
   const inner = Symbol();
   const StateContext = React.createContext();
   const DispatchContext = React.createContext();
   const MODELS = {};
   const REFRESH_CACHE = {};
   let runtime_state = undefined;
   window['dva_react_hook_sotre'] = {
      inner,
      StateContext,
      DispatchContext,
      MODELS,
      REFRESH_CACHE,
      runtime_state
   };
};

export default window['dva_react_hook_sotre'];
