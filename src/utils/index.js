import clone from "../clone";
import { isPlainObject } from "lodash-es";
import { _split, getPathArray, endurance } from "../reducer";

export function get(
  name,
  store,
  options = {
    autoCreate: false,
    defaultValue: undefined,
  }
) {
  validateStore(store);
  validateName(name);

  const names = getPathArray(name);
  const clonedState = getClonedState(names, store, options);

  return [clonedState, createDispatchFn(names, store, clonedState)];
}

function getClonedState(names, store, options) {
  const state = getValue(names, store, options);
  return state;
}

function createDispatchFn(names, store, clonedState) {
  return async (value, { cancelUpdate, callbacks } = {}) => {
    const result = await store.dispatch({
      type: "modify",
      name: names.join(_split),
      data: value,
      inner: store.inner,
      cancelUpdate,
    });
    if (callbacks && store.MODELS[names[0]]) {
      const model = store.MODELS[names[0]];
      execBack(
        model.callbacks,
        callbacks,
        {
          name: names.join(_split),
          value: { pre: clonedState, current: value },
        },
        store
      );
    }
    return result;
  };
}

export function execBack(modelbacks, callbacks, value, store) {
  validateModelbacks(modelbacks);

  const select = (name) => get(name, store);
  if (typeof callbacks === "string") {
    executeCallback(modelbacks, callbacks, value, select);
  } else if (Array.isArray(callbacks)) {
    callbacks.forEach((callbackName) =>
      executeCallback(modelbacks, callbackName, value, select)
    );
  }
}

function executeCallback(modelbacks, callbackName, value, select) {
  if (typeof modelbacks[callbackName] === "function") {
    modelbacks[callbackName]({ info: value, select });
  } else {
    console.error(`Callback ${callbackName} is not a function.`);
  }
}

function validateStore(store) {
  if (!store) {
    throw new Error("strange!! there is no store in utils, please issue it.");
  }
}

function validateName(name) {
  if (typeof name !== "string") {
    throw new Error("name must be a string");
  }
}

function validateModelbacks(modelbacks) {
  if (Object.prototype.toString.call(modelbacks) !== "[object Object]") {
    console.error("the callbacks of model must be an Object type");
  }
}

function getValue(propertyNames, store, options) {
  if (!propertyNames || !propertyNames.length) {
    throw new Error("Property names array cannot be empty.");
  }
  let autocreated = false;
  const r = propertyNames.reduce((accumulator, propertyName, index) => {
    const currentValue = index === 0 ? store.runtime_state : accumulator;
    let nextValue = currentValue[propertyName];
    if (
      propertyNames.length > 1 &&
      index < propertyNames.length - 1 &&
      !isPlainObject(nextValue)
    ) {
      if (options.autoCreate) {
        autocreated = true;
        nextValue = currentValue[propertyName] = {};
      } else {
        throw new Error(
          `${propertyName} is not an object, so the property['${
            propertyNames[index + 1]
          }'] cannot be reached. Please check your code.`
        );
      }
    }
    if (
      index === propertyNames.length - 1 &&
      options.autoCreate &&
      !nextValue
    ) {
      nextValue = currentValue[propertyName] = options.defaultValue;
      if (autocreated) {
        endurance(store, propertyNames, store.runtime_state);
      }
    }
    return nextValue;
  }, {});
  return clone(r);
}
