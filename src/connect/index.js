import React from "react";
import { nanoid } from "nanoid";
import useModel from "../useModel";
import useDispatch from "../useDispatch";
function connect(model, action) {
  return (Component) => {
    return (props) => {
      const [{ value: state }, setState] =
        typeof model === "string" && model.length !== 0
          ? useModel(model)
          : [{ value: null }, null];

      const dispatch =
        typeof action.name === "string" && action.name.length !== 0
          ? useDispatch(action.action)
          : null;
      return (
        <Component
          {...{
            [setState ? `${model}State` : `UselessState${nanoid()}`]: state,
            [setState ? `set${model}` : `UselessSet${nanoid()}`]: setState,
            [dispatch ? `${action.name}` : `UselessDispatch${nanoid()}`]:
              dispatch,
          }}
          {...props}
        />
      );
    };
  };
}

export default connect;
