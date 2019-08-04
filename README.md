# dva-react-hook

> React Hooks based, imitating dva, lightweight framework.



## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [`Provider`](#Provider)
  - [`<Dynamic />`](#Dynamic)
  - [`useModel()`](#useModel)
  - [`useDispatch()`](#usedispatch)
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
import { Provider } from 'redux-react-hook';
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

To do ...

### `Dynamic`

To do ...

### `useModel`

To do ...

### `usedispatch`

To do ...

### `connect`

To do ...

### `useAdd`

To do ...

### `useDispatcher`

To do ...





## License

MIT © Facebook Inc.
