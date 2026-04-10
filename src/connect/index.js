import React from 'react';
import useModel from '../useModel';
import useDispatch from '../useDispatch';
function connect(model, action = {}) {
  return (Component) => {
    return (props) => {
      const [state, setState] =
        typeof model === 'string' && model.length !== 0
          ? useModel(model)
          : [null, null];

      const dispatch =
        action &&
        typeof action.name === 'string' &&
        action.name.length !== 0 &&
        action.action
          ? useDispatch(action.action)
          : null;
      const injectedProps = {
        ...(setState
          ? {
              [`${model}State`]: state,
              [`set${model}`]: setState,
            }
          : {}),
        ...(dispatch
          ? {
              [action.name]: dispatch,
            }
          : {}),
      };
      return <Component {...injectedProps} {...props} />;
    };
  };
}

export default connect;
