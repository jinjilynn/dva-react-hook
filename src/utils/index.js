import store from '../store';
export function get(name,dispatch){
    if(typeof name !== 'string'){
      throw new Error('name must be a string')
    }
    if(name.indexOf('/') === -1){
      return [
        Object.create({get value(){return store.runtime_state[name]}}),
        (value) => { dispatch({ type: 'coverSet',name, data: value, inner:store.inner })}
      ];
    }
    const names = name.split('/');
    const length = names.length;
    
    return [
      Object.create({
        get value(){
          let i = 0;
          let r;
          while(i < length){
            if(names[i].length === 0) {
              throw new Error(`property among the ${names.length} properties -- ${names.join(',')} cannot be an empty string`)
            }
            if(i === 0){
              r = store.runtime_state[names[0]];
            }else{
              r = r[names[i]];
            }
            if(i !== length - 1 && Object.prototype.toString.call(r) !== '[object Object]'){
              throw new Error(`${names[i]} is not object, so the property['${names[i+1]}'] can not be reached,please check your code first`);
            }
            i += 1;
          }
          return r;
        }
      }),
      (value) => { dispatch({ type: 'updateSet',name, data: value, inner:store.inner })}
    ]
  }
