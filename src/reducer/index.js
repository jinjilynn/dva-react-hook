import { nanoid } from "nanoid";
export default function reducer(action) {
  const store = this;
  if (!store) {
    throw new Error("strange!! there is no store in reducer, please issue it.");
  }
  if (action.inner === store.inner) {
    switch (action.type) {
      case "add":
        store.runtime_state[action.name] = action.initdate;
        store.offline &&
          store.offlineInstance.setItem(action.name, action.initdate);
        return;
      case "coverSet":
        store.runtime_state[action.name] = action.data;
        store.offline &&
          store.offlineInstance.setItem(action.name, action.data);
        if (!action.cancelUpdate) {
          const track1 = Object.values(store.REFRESH_CACHE);
          track1.forEach((it) => {
            if (it) {
              action.name === it._s.split("/")[0] && it.set(nanoid());
            }
          });
        }
        return;
      case "updateSet":
        const names = action.name.split("/");
        const keyName = action.name.split("/")[0];
        const length = names.length;
        let temp = store.runtime_state;
        let i = 0;
        while (i < length) {
          if (i === length - 2) {
            temp[names[i]][names[i + 1]] = action.data;
          }
          temp = temp[names[i]];
          i += 1;
        }
        store.offline &&
          store.offlineInstance.setItem(keyName, store.runtime_state[keyName]);
        if (!action.cancelUpdate) {
          const track2 = Object.values(store.REFRESH_CACHE);
          track2.forEach((it) => {
            it && action.name === it._s && it.set(nanoid());
          });
        }
        return;
      default: {
        throw new Error(`Unhandled action type: ${action.type}`);
      }
    }
  } else {
    if (typeof action.name !== "string") {
      throw new Error("name must be a string");
    }
    if (!store.runtime_state.hasOwnProperty(action.name)) {
      throw new Error(
        `you dont not have the state name -- ${action.name} right now !`
      );
    }
    const data =
      typeof action.data === "function" ? action.data() : action.data;
    switch (action.type) {
      case "set":
        store.runtime_state[action.name] = data;
        store.offline && store.offlineInstance.setItem(action.name, data);
        if (!action.cancelUpdate) {
          const track3 = Object.values(store.REFRESH_CACHE);
          track3.forEach((it) => {
            it && it._s.split("/")[0] === action.name && it.set(nanoid());
          });
        }
        return;
      default: {
        throw new Error(`Unhandled action type: ${action.type}`);
      }
    }
  }
}
