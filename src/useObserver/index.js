import React from "react";
import { useNearestStore } from "../store";

export default function useObserver(path, callback, dependencies = [], _store) {
  const store = _store || useNearestStore();
  if (!store) {
    throw new Error(
      "strange!! there is no store in useModel, please issue it."
    );
  }
  if (typeof callback !== "function") {
    throw new Error("useChange's argument must be a function");
  }
  React.useEffect(() => {
    store.observerSubscribes[path] = callback;
    return () => {
      delete store.observerSubscribes[path];
    };
  }, [path, store, ...dependencies]);
}
