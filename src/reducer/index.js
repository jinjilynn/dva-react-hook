import { nanoid } from "nanoid";
import clone from "../clone";

export const _split = "/";

function isObject(value) {
  const type = typeof value;
  return value != null && type === "object";
}

function getPathArray(path) {
  if (path.endsWith(_split)) {
    path = path.slice(0, -1);
  }
  return path.split(_split);
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
    if (!isObject(currentPart[part])) {
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
  for (let i = 0; i < pathParts.length; i++) {
    if (i === pathParts.length - 1) {
      current[pathParts[i]] = value;
    } else if (!current[pathParts[i]]) {
      current[pathParts[i]] = {};
    }
    current = current[pathParts[i]];
  }
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
        const _state = createNestedObject(_parts, action.initdate);
        store.runtime_state = { ...store.runtime_state, ..._state };
        const keys = await store.offlineInstance.keys();
        if (
          store.offline &&
          !store.offlineExcludes.includes(_parts[0]) &&
          !keys.includes(_parts[0])
        ) {
          const excludes = filterExcludes(store.offlineExcludes, _parts[0]);
          let valuefiltered = clone(_state[_parts[0]], true);
          if (excludes.length > 0) {
            excludes.forEach((path) => {
              valuefiltered = deleteNestedKey(valuefiltered, path);
            });
          }
          await store.offlineInstance.setItem(_parts[0], valuefiltered);
        }
        return;
      case "modify":
        const names = getPathArray(action.name);
        const temp_state = set(store.runtime_state, names, action.data);
        store.runtime_state = { ...temp_state };
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
        if (store.offline) {
          if (store.offline && !store.offlineExcludes.includes(names[0])) {
            let valuefiltered = clone(temp_state[names[0]], true);
            const excludes = filterExcludes(store.offlineExcludes, names[0]);
            if (excludes.length > 0) {
              excludes.forEach((path) => {
                valuefiltered = deleteNestedKey(valuefiltered, path);
              });
            }
            await store.offlineInstance.setItem(names[0], valuefiltered);
          }
        }
        return;
      default: {
        throw new Error(`Unhandled action type: ${action.type}`);
      }
    }
  }
}
