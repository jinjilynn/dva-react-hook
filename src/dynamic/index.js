import React from 'react';
import useDispatcher from '../useDispatcher';
import store from '../store';

export function registeReducers(_, dispatch){
    if(Object.prototype.toString.call(_) !== '[object Object]'){
      throw new Error('your model must be an object');
    }
    if(!_.hasOwnProperty('name')){
      throw new Error('please name your model !!!!')
    }
    if(typeof _.name !== 'string'){
      throw new Error('please make sure your model name is a string')
    }
    if(_.name.length === 0){
      throw new Error('name can not be empty')
    }
    if(store.runtime_state.hasOwnProperty(_.name)){
      console.warn(`registed failed, ${_.name} model has been registed,please change another name`)
    }
    if (!store.MODELS[_.name] && !store.runtime_state.hasOwnProperty(_.name)) {
        store.MODELS[_.name] = _;
        let data = {};
        if(_.hasOwnProperty('init')){
          data = _.init;
        }
        if(typeof _.init === 'function'){
          data = _.init();
        }
        dispatch({
          type:'add',
          name:_.name,
          initdate:data,
          inner:store.inner
        });
    }
  }

function Dynamic(props){
    const [state,setMount] = React.useState({mounted: false,component: null});
    const dispatch = useDispatcher();
    const {models,renderBefore,render,component,...rest} = props;
    React.useEffect(() => {
      typeof renderBefore === 'function' && renderBefore();
      const reducersModel = typeof models === 'function' ? models() : Array.isArray(models) ? models.map(it => Promise.resolve(it)) : [];
      let asyncResources = [];
      let com = Promise.resolve(null);
      if (typeof render === 'function') {
          com = render();
          com.constructor.name !== 'Promise' && (com = Promise.resolve(com))
      }
      if (component) {
          (com = Promise.resolve(component));
      }
      asyncResources = [...reducersModel, com]
      Promise.all(asyncResources).then((ret) => {
          const len = reducersModel.length;
          ret.slice(0, len).forEach((m, index) => {
              m = m.default || m;
              if (!Array.isArray(m)) {
                  m = [m];
              }
              m.map(_ => registeReducers(_,dispatch));
          });
          const Component = ret[len].default || ret[len];
          setMount({mounted:true,component:Component});
      });
    },[]);
    return state.mounted ? state.component.$$typeof ? state.component : <state.component {...rest} /> : null;
  } 

  export default Dynamic;
  