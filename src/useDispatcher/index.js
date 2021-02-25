import {useNearestStore} from '../store';

export default function useDispatcher() {
  const store = useNearestStore();
   if(!store){
     throw new Error('strange!! there is no store in useDispatcher, please issue it.');
   }
  const dispatch = store.dispatch;
  if (typeof dispatch !== 'function') {
    throw new Error('make sure you are in a Provider')
  }
  return store.dispatch
}