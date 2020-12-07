import store from '../store';

export default function useDispatcher() {
  const dispatch = store.dispatch;
  if (typeof dispatch !== 'function') {
    throw new Error('make sure you are in a Provider')
  }
  return store.dispatch
}