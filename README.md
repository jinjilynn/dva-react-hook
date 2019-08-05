# dva-react-hook
[![NPM](https://img.shields.io/badge/npm-v1.0.4-blue)](https://www.npmjs.com/package/dva-react-hook)
[![size](https://img.shields.io/badge/size-842bytes-green)]()
> React Hooks based, imitating dva, lightweight framework.

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [`Provider`](#Provider)
  - [`Dynamic`](#Dynamic)
  - [`useModel()`](#useModel)
  - [`useDispatch()`](#useDispatch)
  - [`connect()`](#connect)
  - [`useAdd()`](#useAdd)
- [Example](#example)
- [FAQ](#faq)
- [License](#license)

## Install

```bash
# Yarn
yarn add dva-react-hook

# NPM
npm install --save dva-react-hook
```

## Quick Start

```tsx
//
// Bootstrap your app
//
import React from 'react';
import { Provider } from 'dva-react-hook';
const initState = {
  name:'Lynn',
  apples:{
      state:'raw',
      count:4
  }
}

ReactDOM.render(
  <Provider {...initState}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
```

```tsx
//
// Individual components
//
import React from 'react';
import { useModel } from 'dva-react-hook';

export default function Counter(){
    const [ { value: name } ] = useModel('name');
    const [ { value: count }, setCount ] = useModel('apples/count');

    const eat = () => {
        setCount(count--)
    }

    return <div>
        <span> { name } has { count } apples</span>
        <button onClick={eat}>Eat One</button>
    </div>    
}

```

## Usage

NOTE: React hooks require `react` and `react-dom` version `16.8.0` or higher.

### `Provider`

The Provider component provides state and dispatch for subcomponents, so it's best to put the Provider component at the top level.

You can pass props to Provider, the props will be initialized into state

##### ps: the state initialized by props can only be changed using the function returned by useModel

```tsx
  const initState = { count: 0 }
  <Provider {...initState}>
    <App />
  </Provider>
```

### `Dynamic`

The Dynamic component is the only entry for registering effects for each model, you can do this in synchronous or asynchronous.

Props|Type|Description
:--:|:--:|:--:
renderBefore  | Function  | you can something before render
component | React.ReactNode  |  A React component to render
render  | Function  |  This allows for convenient inline rendering and wrapping,in addition to the ability to load component with ’import‘ asynchronously
models  | Function \| Array  |  Function should return an array.You can load model asynchronously with ’import‘ or synchronously with array

```tsx
<Dynamic component={ReactNode} />
<Dynamic render={() => <App />} />
<Dynamic render={() => import('url')} />
<Dynamic models={() => [import('url1'),import('url2'),...]} />
<Dynamic models={[model-object,model-object,...] />
```
##### model-object format:
```javascript
{
    name:'some-name',
    init: Function | Object, //optional --default value is {}
    effects:{
      fetch: async({state:{value},setState,select}) => {
      }
    }
}
```



### `useModel`
You can useModel hook to inject a model state into a component.
The only argument to the useModel() Hook is state path.
It returns a pair of values: an object and a function that updates the model state.
The object has a getter named value, value returns the current model state defined by the path.
You can take the value when you define it, or take the value until you use it. The difference is that when you take the second action, you can get the updated value synchronously before the component is re-rendered. It is not recommended to do this when it is not absolutely necessary.


```javascript
const [ user, setUser ] = useModel('user');
const [ { value: total } ] = useModel('list/total');
const [ { value: page }, setPage ] = useModel('list/page');
const click = () => {
  setUser('dva-hook');
  user.value // the value is dva-hook
  setPage(1)
  page // the value is not 1
}
```
##### ps: Usually when a context value is changed, all components that useContext will re-render, but this framework is unusual, so  if only used part of the state is changed, corresponding component will re-render.

### `useDispatch`

useDispatch returns the function you registered in a model effects,the only argument to the useDispatch() Hook is an object, the object must have an property named type, also you can set some other properties.
The function returned by useDispatch is wrapped by an async function and also is injected with an object parameter,so that you can get the state、the function updates it and a selector which can select other models' state.
```javascript
//if your model is like this
{
  name:'login',
  init:{
    name:null,
    age:null,
  },
  effects:{
    // Defining an async function is recommended, but it is not required
    async login({name,pass},{state,setState,select}){

      // state: state.value is the state of login
      // setState: function updates the login state, not partly
      // select: its usage is as same as useModel

      //ps: when the login function is called in your component like below, and you dont pass any argument to it, You can't write any other parameters except the parameters being injected
      //so you code may like this: async login({state,setState,select}){}
    }
  }
}

// you may in your component write these

const loginaction = useDispatch({ type:'login/login', otherproperty:''});
//otherproperty is optional, if you set some other properties, you can get them in the injected argument
// your code maybe like this   async login({name,pass},{state,setState,select, otherproperty }){}



loginaction({name,pass}).then(data => {
  // do something
}).catch(error => {
  // do something
}).finally(() => {
  // do something
})

```

### `connect`

If you are obsessed with writing classes and have no other state management tools, I provide the connect decorator
the connect function receives two arguments, the first is required and the second is optional.
the first argument is useModel's argument
the second argument is useDispatch' argument
In your class component,you will have three new props: hookState、setHookState、dispatch

### `useAdd`

If you want to dynamically inject model state, you can use it.
useAdd has three arguments: name initdata, once

```javascript
useAdd(name, initdate, once)
// name is the model's name
// initdata can be an object or function
// once decided whether to execute only once just like componentDidMount
```





## License

MIT © Facebook Inc.
