import React from "react";
import { nanoid } from "nanoid";
import { useNearestStore } from "../store";

export default function useChange(callback, _store) {
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
    const uid = nanoid();
    store.changeSubscribes[uid] = callback;
    return () => {
      delete store.changeSubscribes[uid];
    };
  }, [store]);
}
