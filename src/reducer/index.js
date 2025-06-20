import { nanoid } from "nanoid";
import clone from "../clone";
import { isPlainObject, get, isEqual, set as _set } from "lodash-es";

export const _split = "/";

const pathCache = new Map();
export function getPathArray(path) {
  if (pathCache.has(path)) {
    return pathCache.get(path);
  }
  if (path.endsWith(_split)) {
    path = path.slice(0, -1);
  }
  const result = path.split(_split);
  pathCache.set(path, result);
  return result;
}

export async function endurance(store, names, temp_state) {
  await new Promise((resolve) => setTimeout(resolve, 10));
  if (store.offline && !store.offlineExcludes.includes(names[0])) {
    let valuefiltered = temp_state[names[0]];
    const excludes = filterExcludes(store.offlineExcludes, names[0]);
    if (excludes.length > 0) {
      valuefiltered = clone(temp_state[names[0]], true);
      excludes.forEach((path) => {
        valuefiltered = deleteNestedKey(valuefiltered, path);
      });
    }
    await store.offlineInstance.setItem(names[0], valuefiltered);
  }
}

function createNestedObject(parts, initvalue) {
  if (typeof parts === "string") {
    parts = getPathArray(parts);
  }
  let obj = {};
  let currentPart = obj;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    currentPart[part] = i === parts.length - 1 ? initvalue : {};
    currentPart = currentPart[part];
  }
  return obj;
}

function filterExcludes(exarray, name) {
  if (exarray && Array.isArray(exarray)) {
    return exarray.filter((path) => getPathArray(path)[0] === name);
  }
  return [];
}

function deleteNestedKey(obj, parts) {
  if (typeof parts === "string") {
    parts = getPathArray(parts);
  }
  parts = parts.slice(1);
  let currentPart = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!isPlainObject(currentPart[part])) {
      return obj;
    }
    currentPart = currentPart[part];
  }

  delete currentPart[parts[parts.length - 1]];

  return obj;
}

function set(obj, path, value) {
  const pathParts = Array.isArray(path) ? path : getPathArray(path);
  const len = pathParts.length;
  let current = obj;
  for (let i = 0; i < len - 1; i++) {
    const part = pathParts[i];
    if (!isPlainObject(current[part])) {
      current[part] = {};
    }
    current = current[part];
  }
  current[pathParts[len - 1]] = value;
  return obj;
}

export function checkPrefixRelation(prearray, currentarray) {
  if (prearray.length > currentarray.length) {
    return false;
  }
  for (let i = 0; i < prearray.length; i++) {
    if (prearray[i] !== currentarray[i]) {
      return false;
    }
  }
  return true;
}

export default async function reducer(action) {
  const store = this;
  if (!store) {
    throw new Error("odd!! there is no store in reducer, please issue it.");
  }
  if (action.inner === store.inner) {
    const debounceTimers = store.debounceTimers;
    const currentStateMap = store.currentStateMap;
    const previousStateMap = store.previousStateMap;
    const onChangeOtherProps = store.onChangeOtherProps;
    const namestring = action.name;
    const names = getPathArray(namestring);
    const excludesarray = store.offlineExcludes;
    const isexcluded = excludesarray.some((path) =>
      checkPrefixRelation(getPathArray(path), names)
    );
    const prestate = get(store.runtime_state, names.join("."));
    let onchangerun = false;
    if (!debounceTimers.has(namestring) && !isexcluded) {
      if (!isEqual(prestate, action.data)) {
        const pre_state = clone(get(store.runtime_state, names.join(".")));
        const prestorestate = {};
        Object.keys(onChangeOtherProps).forEach((key) => {
          const othercache = {};
          const otherprops = onChangeOtherProps[key];
          otherprops.forEach((prop) => {
            const paths = getPathArray(prop);
            const data = get(store.runtime_state, paths.join("."));
            _set(othercache, paths.join("."), clone(data));
          });
          prestorestate[key] = othercache;
        });
        previousStateMap.set(namestring, {
          prestorestate,
          prevalue: pre_state,
        });
        onchangerun = true;
      }
    }
    switch (action.type) {
      case "add":
        const init_data = clone(action.data);
        if (previousStateMap.has(namestring)) {
          currentStateMap.set(namestring, init_data);
        }
        const _state = createNestedObject(names, init_data);
        store.runtime_state = { ...store.runtime_state, ..._state };
        const keys = await store.offlineInstance.keys();
        if (!keys.includes(names[0]))
          endurance(store, names, store.runtime_state);
        break;
      case "modify":
        if (isEqual(prestate, action.data)) {
          return;
        }
        const action_data = action.referenced
          ? action.data
          : clone(action.data);
        if (previousStateMap.has(namestring)) {
          currentStateMap.set(namestring, action_data);
        }
        const temp_state = set(store.runtime_state, names, action_data);
        if (!action.cancelUpdate) {
          const track = Object.values(store.REFRESH_CACHE);
          const parentTrack = `${names.join(_split)}${_split}`;
          track.forEach((it) => {
            if (it && it._s.startsWith(parentTrack)) {
              it.set(nanoid());
            }
            const _names = [...names];
            while (_names.length > 0) {
              if (it && _names.join(_split) === it._s) {
                it.set(nanoid());
              }
              _names.pop();
            }
          });
        }
        endurance(store, names, temp_state);
        break;
      default: {
        throw new Error(`Unhandled action type: ${action.type}`);
      }
    }
    if (!onchangerun) return;
    if (debounceTimers.has(namestring)) {
      clearTimeout(debounceTimers.get(namestring));
    }
    debounceTimers.set(
      namestring,
      setTimeout(() => {
        const previousstate = previousStateMap.get(namestring);
        const currentstate = currentStateMap.get(namestring);
        const subscribers = Object.keys(store.changeSubscribes);
        subscribers.forEach((k) => {
          const callback = store.changeSubscribes[k];
          const prevalue = previousstate.prevalue;
          const otherprevalues = previousstate.prestorestate[k];
          callback({
            name: namestring,
            currentvalue: currentstate,
            prevalue,
            otherprevalues,
            currentstore: store.runtime_state,
          });
        });
        for (const key in store.observerSubscribes) {
          const paths = getPathArray(key);
          const namelength = names.length;
          const pathlength = paths.length;
          if (namelength === pathlength) {
            if (isEqual(names, paths)) {
              store.observerSubscribes[key](currentstate, previousstate);
            }
          }
          if (namelength > pathlength) {
            if (checkPrefixRelation(paths, names)) {
              const parentcurrentstate = get(store.runtime_state, paths);
              store.observerSubscribes[key](parentcurrentstate, {
                path: names,
                value: currentstate,
                prevalue: previousstate,
              });
            }
          }
          if (namelength < pathlength) {
            if (checkPrefixRelation(names, paths)) {
              if (!isEqual(previousstate.prevalue, currentstate)) {
                const childpaths = paths.filter((p) => !names.includes(p));
                store.observerSubscribes[key](
                  get(currentstate, childpaths),
                  get(previousstate, childpaths)
                );
              }
            }
          }
        }
        debounceTimers.delete(namestring);
        previousStateMap.delete(namestring);
        currentStateMap.delete(namestring);
      }, store.changedelay)
    );
  }
}
