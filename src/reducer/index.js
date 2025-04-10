import { nanoid } from "nanoid";
import clone from "../clone";
import { isPlainObject, get, isEqual } from "lodash-es";

export const _split = "/";

export function getPathArray(path) {
  if (path.endsWith(_split)) {
    path = path.slice(0, -1);
  }
  return path.split(_split);
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
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!isPlainObject(current[pathParts[i]])) {
      current[pathParts[i]] = {};
    }
    current = current[pathParts[i]];
  }
  current[pathParts[pathParts.length - 1]] = value;
  return obj;
}

export default async function reducer(action) {
  const store = this;
  if (!store) {
    throw new Error("strange!! there is no store in reducer, please issue it.");
  }
  if (action.inner === store.inner) {
    switch (action.type) {
      case "add":
        const _parts = getPathArray(action.name);
        const _state = createNestedObject(_parts, clone(action.initdate));
        store.runtime_state = { ...store.runtime_state, ..._state };
        const keys = await store.offlineInstance.keys();
        if (!keys.includes(_parts[0]))
          endurance(store, _parts, store.runtime_state);
        break;
      case "modify":
        const names = getPathArray(action.name);
        const pre_state = get(store.runtime_state, names.join("."));
        const action_data = clone(action.data);
        if (isEqual(pre_state, action_data)) {
          return;
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
    queueMicrotask(() => {
      const currentstate = clone(store.runtime_state, true);
      const subscribers = Object.values(store.changeSubscribes);
      subscribers.forEach((fn) =>
        fn(action, currentstate, store.runtime_state)
      );
    });
  }
}
