import React from "react";
import { useNearestStore } from "../store";

export async function registeModel(_, store) {
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
  if (!store.runtime_state.hasOwnProperty(_.name) || !!store.noCached) {
    let data = {};
    if (_.hasOwnProperty("init")) {
      data = _.init;
    }
    if (typeof _.init === "function") {
      data = _.init();
    }
    await store.dispatch({
      type: "add",
      name: _.name,
      data,
      inner: store.inner,
    });
  }
}

function Dynamic(props) {
  const store = useNearestStore();

  if (!store) {
    throw new Error("strange!! there is no store in dynamic, please issue it.");
  }

  const [state, setMount] = React.useState({ loaded: false });
  const { models, renderBefore, component, ...rest } = props;

  const LazyComponent = React.lazy(component);

  React.useEffect(() => {
    renderBefore?.();

    const getModelPromises = () => {
      if (typeof models === "function") return [models()];
      if (Array.isArray(models)) return models.map((it) => Promise.resolve(it));
      return [];
    };

    const asyncResources = getModelPromises();

    Promise.all(asyncResources).then((ret) => {
      ret.forEach((m) => {
        const modelsToRegister = m.default || m;
        const modelArray = Array.isArray(modelsToRegister)
          ? modelsToRegister
          : [modelsToRegister];
        modelArray.forEach((model) => registeModel(model, store));
      });
      setMount({ loaded: true });
    });
  }, []);

  return state.loaded ? (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...rest} />
    </React.Suspense>
  ) : null;
}

export default Dynamic;
