import React from "react";
import { nanoid } from "nanoid";
import { get } from "../utils";
import { useNearestStore } from "../store";
import { isEqual } from "lodash-es";

export default function useModel(name, cancelupdate, _store, options) {
  const store = _store || useNearestStore();
  if (!store) {
    throw new Error(
      "strange!! there is no store in useModel, please issue it."
    );
  }
  if (typeof name !== "string") {
    throw new Error("useModel's argument must be a string");
  }
  const setState = React.useState(nanoid())[1];
  React.useEffect(() => {
    const uid = nanoid();
    !cancelupdate && (store.REFRESH_CACHE[uid] = { _s: name, set: setState });
    return () => {
      !cancelupdate && delete store.REFRESH_CACHE[uid];
    };
  }, [name]);
  const [value, setValue, getlatest] = get(name, store, options);
  const valueref = React.useRef(value);
  const memovalue = React.useMemo(() => {
    const equal = isEqual(valueref.current, value);
    if (!equal) {
      valueref.current = value;
    }
    return valueref.current;
  }, [value]);
  return [memovalue, setValue, getlatest];
}
