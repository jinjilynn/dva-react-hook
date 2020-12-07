import store from '../store';

function useHState(){
    const state = store.runtime_state;
    if (state === undefined) {
      throw new Error('useHState hook must be used within a Provider');
    }
    !store.runtime_state && (store.runtime_state = state);
  }

  export default useHState;