import store from '../store';
export function get(name, dispatch) {
  if (typeof name !== 'string') {
    throw new Error('name must be a string')
  }
  if (name.indexOf('/') === -1) {
    return [
      Object.create({ get value() { return clone(store.runtime_state[name], true) } }),
      (value, { cancelUpdate, callbacks } = {}) => {
        dispatch({ type: 'coverSet', name, data: value, inner: store.inner, cancelUpdate });
        if (callbacks && store.MODELS[name]) {
          const model = store.MODELS[name];
          const modelbacks = model.callbacks;
          const value = clone(store.runtime_state[name], true);
          execBack(modelbacks, callbacks, value);
        }
      }
    ];
  }
  const names = name.split('/');
  return [
    Object.create({
      get value() {
        return getPartValue(names);
      }
    }),
    (value, { cancelUpdate, callbacks } = {}) => {
      dispatch({ type: 'updateSet', name, data: value, inner: store.inner, cancelUpdate });
      if (callbacks && store.MODELS[names[0]]) {
        const model = store.MODELS[names[0]];
        const modelbacks = model.callbacks;
        const value = getPartValue(names);
        execBack(modelbacks, callbacks, value);
      }
    }
  ]
}

export function execBack(modelbacks, callbacks, value) {
  if (Object.prototype.toString.call(modelbacks) !== '[object Object]') {
    console.error('the callbacks of model must be an Object type');
    return;
  }
  if (typeof callbacks === 'string') {
    typeof modelbacks[callbacks] === 'function' && modelbacks[callbacks](value);
  }
  if (Array.isArray(callbacks)) {
    callbacks.forEach(it => {
      typeof modelbacks[it] === 'function' && modelbacks[it](value);
    })
  }
}

function getPartValue(names) {
  let i = 0;
  let r;
  while (i < names.length) {
    if (names[i].length === 0) {
      throw new Error(`property among the ${names.length} properties -- ${names.join(',')} cannot be an empty string`)
    }
    if (i === 0) {
      r = store.runtime_state[names[0]];
    } else {
      r = r[names[i]];
    }
    if (i !== names.length - 1 && Object.prototype.toString.call(r) !== '[object Object]') {
      throw new Error(`${names[i]} is not object, so the property['${names[i + 1]}'] can not be reached,please check your code first`);
    }
    i += 1;
  }
  return clone(r, true);
}


export function clone(obj, deep) {
  if (Object.prototype.toString.call(obj) !== '[object Object]') {
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
