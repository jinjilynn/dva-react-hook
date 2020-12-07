import store from '../store';
export default function useDispatcher() {
    const dispatch = store.dispatch;
    if (dispatch === undefined) {
      throw new Error('useDispatcher must be used within a Provider')
    }
    return dispatch
   }