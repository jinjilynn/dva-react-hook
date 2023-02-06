import React from "react";
import { useNearestStore } from "../store";

export function registeModel(_, store) {
  if (Object.prototype.toString.call(_) !== "[object Object]") {
    throw new Error("your model must be an object");
  }
  if (!_.hasOwnProperty("name")) {
    throw new Error("please name your model !!!!");
  }
  if (typeof _.name !== "string") {
    throw new Error("please make sure your model name is a string");
  }
  if (_.name.length === 0) {
    throw new Error("name can not be empty");
  }
  if (!store) {
    throw new Error("strange!! there is no store, please issue it.");
  }
  if (!store.MODELS[_.name]) {
    store.MODELS[_.name] = _;
  }
  if (!store.runtime_state.hasOwnProperty(_.name)) {
    let data = {};
    if (_.hasOwnProperty("init")) {
      data = _.init;
    }
    if (typeof _.init === "function") {
      data = _.init();
    }
    store.dispatch({
      type: "add",
      name: _.name,
      initdate: data,
      inner: store.inner,
    });
  }
}

function Dynamic(props) {
  const store = useNearestStore();
  if (!store) {
    throw new Error("strange!! there is no store in dynamic, please issue it.");
  }
  const [state, setMount] = React.useState({ mounted: false, component: null });
  const { models, renderBefore, render, component, ...rest } = props;
  React.useEffect(() => {
    typeof renderBefore === "function" && renderBefore();
    const reducersModel =
      typeof models === "function"
        ? models()
        : Array.isArray(models)
        ? models.map((it) => Promise.resolve(it))
        : [];
    let asyncResources = [];
    let com = Promise.resolve(null);
    if (typeof render === "function") {
      com = render();
      com.constructor.name !== "Promise" && (com = Promise.resolve(com));
    }
    if (component) {
      com = Promise.resolve(component);
    }
    asyncResources = [...reducersModel, com];
    Promise.all(asyncResources).then((ret) => {
      const len = reducersModel.length;
      ret.slice(0, len).forEach((m, index) => {
        m = m.default || m;
        if (!Array.isArray(m)) {
          m = [m];
        }
        m.map((_) => registeModel(_, store));
      });
      const Component = ret[len].default || ret[len];
      setMount({ mounted: true, component: Component });
    });
  }, []);
  return state.mounted ? (
    state.component.$$typeof ? (
      state.component
    ) : (
      <state.component {...rest} />
    )
  ) : null;
}

export default Dynamic;
