import {useNearestStore} from '../store';

function useHState(){
  const store = useNearestStore();
   if(!store){
     throw new Error('strange!! there is no store in useHState, please issue it.');
   }
    const state = store.runtime_state;
    if (state === undefined) {
      throw new Error('useHState hook must be used within a Provider');
    }
    !store.runtime_state && (store.runtime_state = state);
  }

  export default useHState;