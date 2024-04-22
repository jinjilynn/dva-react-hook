import {
  cloneDeepWith,
  isTypedArray,
  isElement,
  isFunction,
  isDate,
} from "lodash-es";

function cloneTypedArray(typedArray) {
  return typedArray.constructor.from(typedArray);
}

function isBlob(object) {
  return object instanceof Blob;
}

export function clone(obj, offline = false) {
  return cloneDeepWith(obj, (value) => {
    if (isFunction(value)) {
      return offline ? null : value;
    }
    if (isTypedArray(value)) {
      return cloneTypedArray(value);
    }
    if (isElement(value)) {
      return offline ? null : value;
    }
    if (isDate(value)) {
      return value.getTime();
    }
    if (isBlob(value)) {
      return value;
    }
  });
}
