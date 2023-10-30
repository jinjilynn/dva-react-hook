# dva-react-hook

[![NPM](https://img.shields.io/badge/npm-v2.1.8-blue)](https://www.npmjs.com/package/dva-react-hook)
[![size](https://img.shields.io/badge/size-106KB-green)]()

> React Hooks based, concise、lightweight framework, supporting offline storage, like blob,bufferArray and all primitive types.

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [`Provider`](#Provider)
  - [`Dynamic`](#Dynamic)
  - [`Model`](#Model)
  - [`useModel()`](#useModel)
  - [`useDispatch()`](#useDispatch)
  - [`connect()`](#connect)
  - [`useAdd()`](#useAdd)
- [Example](#Example)
- [License](#license)

## Install

```bash
# Yarn
yarn add dva-react-hook

# NPM
npm install --save dva-react-hook
```

## In Node.js

```javascript
var dvaHook = require("dva-react-hook");
```

## Quick Start

```tsx
//
// Bootstrap your app
//
import React from "react";
import Provider, { useModel } from "dva-react-hook";

function App() {
  const name = useModel("name")[0];
  const [count, setCount] = useModel("apples/count");

  const eat = () => {
    setCount(count - 1);
  };
  return (
    <div>
      <span>
        {" "}
        {name} has {count} apples
      </span>
      <button onClick={eat}>Eat One</button>
    </div>
  );
}

const initState = {
  name: "Lynn",
  apples: {
    state: "raw",
    count: 4,
  },
};

ReactDOM.render(
  <Provider {...initState}>
    <App />
  </Provider>,
  document.getElementById("root")
);
```

## Usage

NOTE: React hooks require `react` and `react-dom` version `16.8.0` or higher.

### `Provider`

The Provider component provides 'state' and 'dispatch' for subcomponents, so it's best to put the Provider component at the top level.

However, you can use Provider multiple times in your project nested in a Provider or not nested. The component inside nested Providers will get the state from the nearest Provider.

If the separated Providers whose prop 'uniqueKey' are the same share the same state, otherwise, their states are isolated from each other. The uniqueKey's type is String and defaults to 'default'.

NOTE: To find the nearest Provider, I use a stack to store the Context. When iterating the stack, as soon as the nearest Provider is found, it will break the loop progress. So 'Warning: React has detected a change in the order of Hooks' may occur, please ignore it, it's okay.

You can pass props (not named by models) to Provider, and the props will be initialized into 'state'. If you want to register models, you can use props named models.

##### ps: the props named models must be an array

```tsx
import React from "react";
import Provider, { useDispatch, useModel } from "dva-react-hook";

function App() {
  const loginState = useModel("login_model")[0];
  const login = useDispatch({ type: "login_model/login" });
  return (
    <div>
      {loginState ? (
        <div>
          <span>{loginState.name} has logged in</span>
          <span>sex:{loginState.sex}</span>
          <span>age:{loginState.age}</span>
        </div>
      ) : (
        <div>
          <span>nobody log in</span>
          <button onClick={login}>登录</button>
        </div>
      )}
    </div>
  );
}

const loginModel = {
  name: "login_model",
  init: {
    name: null,
    sex: null,
    age: null,
  },
  effects: {
    login: async ( { setState }) => {
      const _r = await loginService();
      setState({
        name: "lynn",
        sex: "male",
        age: 22,
      });
    },
  },
};
const initState = { count: 0 };
ReactDOM.render(
  <Provider noCached={ true } offlineConfig={ offline: true, autoRecover: true, excludes:[] } uniqueKey="namespace" {...initState} models={[loginModel]}>
    <App />
  </Provider>,
  document.getElementById("root")
);
```

### `Dynamic`

You can use Dynamic to load components and models asynchronously.

|    Props     |       Type        |                                                              Description                                                              |
| :----------: | :---------------: | :-----------------------------------------------------------------------------------------------------------------------------------: |
| renderBefore |     Function      |                                                  You can do something before render                                                   |
|  component   |  React.ReactNode  |                                                      A React component to render                                                      |
|    render    |     Function      | This allows for convenient inline rendering and wrapping, in addition to the ability to load a component with 'import' asynchronously |
|    models    | Function \| Array |           Function should return an array. You can load a model asynchronously with 'import' or synchronously with an array           |

```tsx
import { Dynamic } from 'dva-react-hook';


<Dynamic component={ReactNode} />
<Dynamic render={() => <App />} />
<Dynamic render={() => import('url')} />
<Dynamic models={() => [import('url1'),import('url2'),...]} />
<Dynamic models={[model-object,model-object,...] />
```

### `Model`

```javascript
{
    name:'some-name',
    init: Function | Object | Number | Array | ..., //optional --default value is {}
    effects:{
      // Defining an async function is recommended, but it is not required
      'some-effects-name': async ({ state, setState, select }) => {
        // { state, setState, select } this parameter is injected by the framework. it is always the last one in arguments. If you call this function by passing other parameters, the other parameters must be added before the injected parameter like this: async (args1, args2, { state, setState, select }) => {}, Otherwise, you will encounter errors

        // state: state.value is the state of this model, You can also declare value ( state:{value}) to get the state

        // setState refer to the useModel

        // select: its usage is as same as useModel

      }
    }
    //optional
    callbacks:{
      'some-callback-name': (value) => {
        // do something with value
      }
    }
}

```

### `useModel`

ou can use the useModel hook to inject a model state into a component.

The parameter required by the useModel Hook is a string path.
It returns a pair of values: a state and a function that updates it.

1. The state represents the current model state defined by the path.

2. The function returned updates the model state, not partly. You can also pass a second argument (optional) of type Object.

|   Property   |                                                        Description                                                         |      Type       |
| :----------: | :------------------------------------------------------------------------------------------------------------------------: | :-------------: |
| cancelUpdate | If the value is true, the corresponding component's update will not be triggered, otherwise the update will be triggered.  |     boolean     |
|  callbacks   | After the function updates the model state is executed, The specified callbacks defined in the model will also be executed | string \| Array |

```javascript
import React from 'react';
import Provider, { useDispatch, useModel } from 'dva-react-hook';

function App(){
  const eat = useDispatch({ type: 'apple/eat' });
  const apple = useModel('apple')[0];
  function eatOne(){
    eat(1);
  }
  return <div>
      <span>there are {apple.count} apples</span>
      <button onClick={eatOne}>eat one apple</button>
  </div>
}

const apple_model = {
  name: 'apple',
  init: {
    count:8
  },
  effects: {
    eat: (num, {state, setState }) => {
      setState({count: satae.count - num}, { cancelUpdate: true, callbacks: 'show-left-count' });
    }
  },
  callbacks: {
    'show-left-count': (v){
     alert(`the left count is ${v.count}`);
    }
  }
}
ReactDOM.render(
  <Provider  models={[apple_model]}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
```

### `useDispatch`

useDispatch returns the function you registered in effects. The only argument to the useDispatch Hook is an object; the object must have a property named type. You can also set some other properties.
The function returned by useDispatch is wrapped by an async function and is also injected with an object parameter, so you can get the state of the model, the function updates it, and a selector which can select other models' state and set other models' state.

```javascript
const loginaction = useDispatch({ type: "login/login", otherproperties: "" });
//otherproperty is optional, if you set some other properties, you can get them in the injected argument

//so your code in model maybe like this   async login({ name,pass },{ state, setState, select, otherproperties }){}

loginaction({ name, pass })
  .then((data) => {
    // do something
  })
  .catch((error) => {
    // do something
  })
  .finally(() => {
    // do something
  });
```

### `connect`

If you are obsessed with writing classes and have no other state management tools, I provide the connect decorator.
The connect decorator receives two arguments: the first is required, and the second is optional.
The first argument is the same as useModel's.
The second argument is an object that has 'name' and 'action' properties.
In your class component, you will have three new props: xxxState, setXXX, and the value of the name property.

```javascript
import { connect } from 'dva-react-hook';

@connect('list/page',{ name:'dispatch1', action: { type: 'list/fetch' } });
@connect('property',{ name:'dispatch2', action: { type: 'space/fetch' } })
// You can call the connect decorator multiple times to inject multiple actions and models
class Demo extends React.Component{
  render(){
    return <div></div>
  }
}
```

##### ps: Each class component can only be injected with one props and one dispatch. This is entirely due to the single responsibility principle to make the components as clear and easy to understand as possible.

### `useAdd`

If you want to dynamically inject model state, you can use it.
useAdd has three arguments: name, initdata, and once.

```javascript
import { useAdd } from "dva-react-hook";

useAdd(name, initdate, once);
// name is the model's name
// initdata can be an object or function
// once decided whether to execute only once just like componentDidMount
```

## Example

- [`example`](https://github.com/jinjilynn/dva-hook-demo)

## License

MIT © Facebook Inc.
