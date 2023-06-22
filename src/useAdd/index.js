import React from "react";
import useDispatcher from "../useDispatcher";
import { useNearestStore } from "../store";

export default function useAdd(name, initdate, once) {
  const store = useNearestStore();
  if (!store) {
    throw new Error("strange!! there is no store in useAdd, please issue it.");
  }
  if (typeof name !== "string") {
    throw new Error("name must be a string");
  }
  if (name.length === 0) {
    throw new Error("name can not be empty");
  }
  const dispatch = useDispatcher();
  if (store.runtime_state === undefined || dispatch === undefined) {
    throw new Error("useAdd must be used within a Provider");
  }
  if (store.runtime_state.hasOwnProperty(name)) {
    console.warn(`you have already added the state name -- ${name}  before !`);
  }
  let data = initdate;
  if (typeof initdate === "function") {
    data = initdate();
  }
  React.useEffect(
    () => {
      dispatch({ type: "add", name, initdate: data, inner: store.inner });
    },
    once ? [] : undefined
  );
}
