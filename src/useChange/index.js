import React from "react";
import { nanoid } from "nanoid";
import { useNearestStore } from "../store";

export default function useChange(callback, dependencies = [], options = {}) {
  let { store, others = [] } = options;
  store = store || useNearestStore();
  if (!store) {
    throw new Error("odd!! there is no store in useModel, please issue it.");
  }
  if (typeof callback !== "function") {
    throw new Error("useChange's argument must be a function");
  }
  React.useEffect(() => {
    const uid = nanoid();
    store.changeSubscribes[uid] = callback;
    if (others.length > 0) {
      store.onChangeOtherProps[uid] = others;
    }
    return () => {
      delete store.changeSubscribes[uid];
      if (others.length > 0) {
        delete store.onChangeOtherProps[uid];
      }
    };
  }, [store, ...dependencies]);
}
