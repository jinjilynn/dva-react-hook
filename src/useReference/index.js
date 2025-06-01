import React from "react";
import { nanoid } from "nanoid";
import { get } from "../utils";
import { useNearestStore } from "../store";

export default function useReference(name, cancelupdate, options = {}) {
  const _store = options.store || useNearestStore();
  if (!_store) {
    throw new Error(
      "odd!! there is no store in useReference, please issue it."
    );
  }
  if (typeof name !== "string") {
    throw new Error("useReference's name must be string");
  }
  const setState = React.useState(nanoid())[1];
  React.useEffect(() => {
    const uid = nanoid();
    !cancelupdate && (_store.REFRESH_CACHE[uid] = { _s: name, set: setState });
    return () => {
      !cancelupdate && delete _store.REFRESH_CACHE[uid];
    };
  }, [name, _store, cancelupdate]);
  options.referenced = true;
  const [value, setValue] = get(name, _store, options);
  return [value, setValue];
}
