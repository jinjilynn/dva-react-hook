import store from '../store';
export function get(name,dispatch){
    if(typeof name !== 'string'){
      throw new Error('name must be a string')
    }
    if(name.indexOf('/') === -1){
      return [
        Object.create({get value(){return clone(store.runtime_state[name],true)}}),
        (value) => { dispatch({ type: 'coverSet',name, data: value, inner:store.inner })},
        (value) => { dispatch({ type: 'coverSet',name, data: value, inner:store.inner,cancelUpdate:true })}
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
          return clone(r,true);
        }
      }),
      (value) => { dispatch({ type: 'updateSet',name, data: value, inner:store.inner })},
      (value) => { dispatch({ type: 'updateSet',name, data: value, inner:store.inner,cancelUpdate:true })}
    ]
  }

  export function clone(obj, deep) {
    if(Object.prototype.toString.call(obj) !== '[object Object]'){
      return obj;
    }
    return extend({}, deep, obj);
  };
  
  function extend(obj, deep) {
    var argsStart,
      args,
      deepClone;
  
    if (typeof deep === 'boolean') {
      argsStart = 2;
      deepClone = deep;
    } else {
      argsStart = 1;
      deepClone = true;
    }
  
    for (var i = argsStart; i < arguments.length; i++) {
      var source = arguments[i];
  
      if (source) {
        for (var prop in source) {
          if (deepClone && source[prop] && source[prop].constructor === Object) {
            if (!obj[prop] || obj[prop].constructor === Object) {
              obj[prop] = obj[prop] || {};
              extend(obj[prop], deepClone, source[prop]);
            } else {
              obj[prop] = source[prop];
            }
          } else {
            obj[prop] = source[prop];
          }
        }
      }
    }
  
    return obj;
  };
