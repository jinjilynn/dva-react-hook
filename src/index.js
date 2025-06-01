import Provider from "./provider";
import { get } from "./utils";

export { default as connect } from "./connect";
export { default as Dynamic } from "./dynamic";
export { default as useAdd } from "./useAdd";
export { default as useDispatch } from "./useDispatch";
export { default as useModel } from "./useModel";
export { default as useChange } from "./useChange";
export { default as useObserver } from "./useObserver";
export { default as useReference } from "./useReference";
export { useNearestStore } from "./store";

export { checkPrefixRelation, getPathArray } from "./reducer";
export { default as clone } from "./clone";
export { get };

export default Provider;
