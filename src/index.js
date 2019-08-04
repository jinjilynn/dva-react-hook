/* createed by jilin.jin  */

import React from 'react'

const inner = Symbol();
const StateContext = React.createContext()
const DispatchContext = React.createContext()
const MODELS = {};
const REFRESH_CACHE = {};
let runtime_state;

function registeReducers(_, dispatch){
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
  if(runtime_state.hasOwnProperty(_.name)){
    console.warn(`registed failed, ${_.name} model has been registed,please change another name`)
  }
  if (!MODELS[_.name] && !runtime_state.hasOwnProperty(_.name)) {
      MODELS[_.name] = _;
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
        inner
      });
  }
}


function reducer(state,action){
  !runtime_state && (runtime_state = state);
  if(action.inner === inner){
    switch(action.type){
      case 'add':
        runtime_state = {
          ...runtime_state,
          [action.name]:action.initdate
        }
        return runtime_state;
      case 'coverSet':
        runtime_state = {
          ...runtime_state,
          [action.name]:action.data
        }
        const track1 = Object.values(REFRESH_CACHE);
        track1.forEach(it => {it && action.name === it._s && it.set(Math.random())});
        return state
      case 'updateSet':
        const names = action.name.split('/');
        const length = names.length;
        let temp = runtime_state;
        let i = 0;
        while(i < length){
          if(i === length - 2){
            temp[names[i]][names[i + 1]] = action.data
          }
          temp = temp[names[i]]
          i += 1;
        }
        const track2 = Object.values(REFRESH_CACHE);
        track2.forEach(it => {it && action.name === it._s && it.set(Math.random())});
        return state
      default: {
              throw new Error(`Unhandled action type: ${action.type}`)
      }
    }
  }else {
    if(typeof action.name !== 'string'){
      throw new Error('name must be a string')
    }
    if(!runtime_state.hasOwnProperty(action.name)){
      throw new Error(`you dont not have the state name -- ${action.name} right now !`)
    }
    const data = typeof action.data === 'function' ? action.data() : action.data;
    switch(action.type){
      case 'set':
        runtime_state = {
          ...runtime_state,
          [action.name]: data
        }
        const track3 = Object.values(REFRESH_CACHE);
        track3.forEach(it => {
          it && it._s.split('/').includes(action.name) && it.set(Math.random())
        });
        return state
      default: {
          throw new Error(`Unhandled action type: ${action.type}`)
      }
    }
  }
    
}
function initState($i){
  runtime_state = undefined;
  return $i;
}
function Provider({children,...rest}) {
    const [state, dispatch] = React.useReducer(reducer, {...rest}, initState)
    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    )
}

export function useDispatch(action){
     if(Object.prototype.toString.call(action) !== '[object Object]'){
        throw new Error('action in useDispatch must be an Object');
     }
     if(!action.hasOwnProperty('type')){
        throw new Error('action in useDispatch must have a property named "type"');
     }
     if(typeof action.type !== 'string'){
        throw new Error('your must be a string');
     }
     if(action.type.indexOf('/') === -1){
        throw new Error('you must do some effects in your type');
     }
     useHState();
     const dispatch = useDispatcher();

     let { type ,...others} = action;
     type = type.split('/');
     if(type[0].length === 0){
      throw new Error('can not resolve the empty model name');
     }
     const model = MODELS[type[0]];
     if(!model){
        throw new Error(`can not find the Model named ${type[0]}`);
     }
     if(!model.hasOwnProperty('effects')){
      throw new Error(`can not find the effects in the Model ${type[0]}`);
     }
     const effects = model.effects;
     if(Object.prototype.toString.call(effects) !== '[object Object]'){
      throw new Error('effects must be an Object');
   }
     let effect = effects[type[1]];
     if( typeof effect !== 'function'){
        throw new Error(`the effect named ${type[1]} must be a function`);
     }
     const effectwrapped = async (...rest) => {
      return effect(...rest,{...others,state:Object.create({get value(){return runtime_state[type[0]]}}),setState:(data) => {
        dispatch({
          type:'set',
          name:type[0],
          data
        })
      },
      select:(name) => {
        return get(name,dispatch);
      }
      });
     } 
     return effectwrapped;
}

export function useDispatcher() {
    const dispatch = React.useContext(DispatchContext)
    if (dispatch === undefined) {
      throw new Error('useDispatcher must be used within a Provider')
    }
    return dispatch
}

function useHState(){
  const state = React.useContext(StateContext);
  if (state === undefined) {
    throw new Error('useHState hook must be used within a Provider')
  }
  !runtime_state && (runtime_state = state);
  return runtime_state;
}

export function useAdd(name, initdate, once){
    if(typeof name !== 'string'){
      throw new Error('name must be a string')
    }
    if(name.length === 0){
      throw new Error('name can not be empty')
    }
    useHState();
    const dispatch = useDispatcher()
    if (runtime_state === undefined || dispatch === undefined) {
      throw new Error('useAdd must be used within a Provider')
    }
    if(runtime_state.hasOwnProperty(name)){
      throw new Error(`you have already added the state name -- ${name}  before !`)
    }
    let data = initdate;
    if(typeof initdate === 'function'){
      data = initdate();
    }
    React.useEffect(() => {
      dispatch({type:'add',name,initdate:data,inner});
    },once ? [] : undefined)
}

function get(name,dispatch){
  if(typeof name !== 'string'){
    throw new Error('name must be a string')
  }
  if(name.indexOf('/') === -1){
    return [
      Object.create({get value(){return runtime_state[name]}}),
      (value) => { dispatch({ type: 'coverSet',name, data: value, inner })}
    ];
  }
  const names = name.split('/');
  const length = names.length;
  
  return [
    Object.create({
      get value(){
        let i = 0;
        let r;
        while(i < length){
          if(names[i].length === 0) {
            throw new Error(`property among the ${names.length} properties -- ${names.join(',')} cannot be an empty string`)
          }
          if(i === 0){
            r = runtime_state[names[0]];
          }else{
            r = r[names[i]];
          }
          if(i !== length - 1 && Object.prototype.toString.call(r) !== '[object Object]'){
            throw new Error(`${names[i]} is not object, so the property['${names[i+1]}'] can not be reached,please check your code first`);
          }
          i += 1;
        }
        return r;
      }
    }),
    (value) => { dispatch({ type: 'updateSet',name, data: value, inner })}
  ]
}

function removeConnect(uid){
  delete REFRESH_CACHE[uid];
}

export function useModel(name){
    if(typeof name !== 'string'){
      throw new Error('useModel\'s argument must be a string')
    }
    useHState();
    const [state, setState] = React.useState(Math.random());
    React.useEffect(() => {
      const uid = `$$track_uid${Math.random().toString().replace(/./,'')}`
      REFRESH_CACHE[uid] = {_s:name,set:setState};
      return () => {
        removeConnect(uid);
      }
    },[])
    const dispatch = useDispatcher()
    return get(name,dispatch);
}
export function connect(model,action){
  useHState();
  return (Component) => {
    return (props) =>{
      const [ state,setState ] = useModel(model);
      const dispatch = useDispatch(action);
      return <Component hookState = { state } setHookState={ setState } dispatch={dispatch} {...props}/>
    }
  }
}
export function Dynamic(props){
  const [state,setMount] = React.useState({mounted: false,component: null});
  const dispatch = useDispatcher();
  useHState()
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


export default Provider;




