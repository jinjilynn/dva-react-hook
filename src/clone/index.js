import {
  cloneDeepWith,
  isTypedArray,
  isElement,
  isFunction,
  isDate,
} from 'lodash-es';

function cloneTypedArray(typedArray) {
  return typedArray.constructor.from(typedArray);
}

function isBlob(object) {
  return object instanceof Blob;
}

function isCopyMeaningless(obj) {
  return (
    obj instanceof Worker ||
    obj instanceof Promise ||
    obj instanceof RegExp ||
    obj instanceof Node ||
    obj instanceof Event ||
    typeof obj === 'symbol' ||
    obj instanceof WeakMap ||
    obj instanceof WeakSet
  );
}

export default function clone(obj, offline = false) {
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
    if (isCopyMeaningless(value)) {
      return offline ? null : value;
    }
  });
}
