# dva-react-hook

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
  - [`useDispatcher()`](#useDispatcher)
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
import { useModel } ffrom 'dva-react-hook';

export function Counter(){
    const [ { value: name } ] = useModel('name');
    const [ { value: count }, setCount ] = useModel('apples/count');

    const eat = () => {
        setCount(count--)
    }

    return (
        <span> { name } has { count } apples</span>
        <button onClick={eat}>Eat One</button>
  );
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
|| <Dynamic component={ReactNode} />
render  | Function  |  This allows for convenient inline rendering and wrapping,in addition to the ability to load component with ’import‘ asynchronously
||<Dynamic render={() => <App />} />
||<Dynamic render={() => import('url')} />
models  | Function \| Array  |  Function should return an array.You can load model asynchronously with ’import‘ or synchronously with array
||<Dynamic models={() => [import('url1'),import('url2'),...]} />
||<Dynamic models={[model-object,model-object,...] />

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
######ps: Usually when a context value is changed, all components that useContext will re-render, but this framework is unusual, so  if only used part of the state is changed, corresponding component will re-render.

### `useDispatch`

To do ...

### `connect`

To do ...

### `useAdd`

To do ...

### `useDispatcher`

To do ...





## License

MIT © Facebook Inc.
