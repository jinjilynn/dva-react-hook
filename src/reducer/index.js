import store from '../store';

export default function reducer(state,action){
    !store.runtime_state && (store.runtime_state = state);
    if(action.inner === store.inner){
      switch(action.type){
        case 'add':
          store.runtime_state = {
            ...store.runtime_state,
            [action.name]:action.initdate
          }
          return store.runtime_state;
        case 'coverSet':
          store.runtime_state = {
            ...store.runtime_state,
            [action.name]:action.data
          }
          const track1 = Object.values(store.REFRESH_CACHE);
          track1.forEach(it => {it && action.name === it._s && it.set(Math.random())});
          return state
        case 'updateSet':
          const names = action.name.split('/');
          const length = names.length;
          let temp = store.runtime_state;
          let i = 0;
          while(i < length){
            if(i === length - 2){
              temp[names[i]][names[i + 1]] = action.data
            }
            temp = temp[names[i]]
            i += 1;
          }
          const track2 = Object.values(store.REFRESH_CACHE);
          track2.forEach(it => {it && action.name === it._s && it.set(Math.random())});
          return state
        default: {
                throw new Error(`Unhandled action type: ${action.type}`)
        }
      }
    }else {
      if(typeof action.name !== 'string'){
        throw new Error('name must be a string')
      }
      if(!store.runtime_state.hasOwnProperty(action.name)){
        throw new Error(`you dont not have the state name -- ${action.name} right now !`)
      }
      const data = typeof action.data === 'function' ? action.data() : action.data;
      switch(action.type){
        case 'set':
          store.runtime_state = {
            ...store.runtime_state,
            [action.name]: data
          }
          const track3 = Object.values(store.REFRESH_CACHE);
          track3.forEach(it => {
            it && it._s.split('/').includes(action.name) && it.set(Math.random())
          });
          return state
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
      }
    }
      
  }