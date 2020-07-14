import React from 'react';
import useModel from '../useModel';
import useDispatch from '../useDispatch';
function connect(model, action) {
  return (Component) => {
    return (props) => {
      const [{ value: state }, setState] = typeof model === 'string' && model.length !== 0 ? useModel(model) : [{ value: null }, null];

      const dispatch = typeof action.name === 'string' && action.name.length !== 0 ? useDispatch(action.action) : null;
      return <Component {...{ [setState ? `${model}State` : `UselessState${Math.random()}`]: state, [setState ? `set${model}` : `UselessSet${Math.random()}`]: setState, [dispatch ? `${action.name}` : `UselessDispatch${Math.random()}`]: dispatch }} {...props} />
    }
  }
}

export default connect;