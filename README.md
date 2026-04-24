# dva-react-hook

[![NPM](https://img.shields.io/badge/npm-v2.7.2-blue)](https://www.npmjs.com/package/dva-react-hook)
[![size](https://img.shields.io/badge/size-120KB-green)]()

> React Hooks based, concise, lightweight state-management framework with
> first-class support for offline persistence (including `Blob`,
> `ArrayBuffer`, typed arrays and all primitive types).

> ⚠️ Version `2.4.0` is deprecated (emergency bug). Use `2.4.1+`.

## Table of Contents

- [dva-react-hook](#dva-react-hook)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
    - [In Node.js](#in-nodejs)
  - [Quick Start](#quick-start)
  - [Usage](#usage)
    - [`Provider`](#provider)
    - [`offlineConfig`](#offlineconfig)
      - [Examples](#examples)
    - [`Dynamic`](#dynamic)
      - [Examples](#examples-1)
    - [`Model`](#model)
      - [Helpers injected into effects](#helpers-injected-into-effects)
      - [Examples](#examples-2)
    - [`Model.callbacks`](#modelcallbacks)
      - [Examples](#examples-3)
    - [`connect`](#connect)
      - [Plain-HOC form (no decorator support)](#plain-hoc-form-no-decorator-support)
    - [`useAdd`](#useadd)
      - [Examples](#examples-4)
    - [`useModel`](#usemodel)
      - [More examples](#more-examples)
    - [`useReference`](#usereference)
      - [More examples](#more-examples-1)
    - [`useDispatch`](#usedispatch)
      - [More examples](#more-examples-2)
    - [`useChange`](#usechange)
      - [More examples](#more-examples-3)
    - [`useObserver`](#useobserver)
      - [More examples](#more-examples-4)
    - [`useNearestStore`](#useneareststore)
      - [Examples](#examples-5)
    - [Utility exports](#utility-exports)
      - [Examples](#examples-6)
  - [TypeScript](#typescript)
  - [License](#license)

## Install

```bash
# Yarn
yarn add dva-react-hook

# NPM
npm install --save dva-react-hook
```

### In Node.js

```javascript
var dvaHook = require('dva-react-hook');
```

## Quick Start

```tsx
import React from 'react';
import Provider, { useModel } from 'dva-react-hook';

function App() {
  const name = useModel('name')[0];
  const [count, setCount] = useModel('apples/count');

  const eat = () => setCount(count - 1);

  return (
    <div>
      <span>
        {name} has {count} apples
      </span>
      <button onClick={eat}>Eat One</button>
    </div>
  );
}

const initState = {
  name: 'Lynn',
  apples: {
    state: 'raw',
    count: 4,
  },
};

ReactDOM.render(
  <Provider {...initState}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
```

## Usage

> React hooks require `react` and `react-dom` `>= 16.8.0`.

### `Provider`

The `Provider` component injects the store into its subtree. In most apps
you place a single `Provider` at the root, but multiple (nested or sibling)
Providers are fully supported. Components always bind to the **nearest**
Provider.

| Prop            | Type               | Default     | Description                                                                                                                                                                         |
| --------------- | ------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uniqueKey`     | `string \| number` | `'default'` | Shares state across sibling Providers. Two Providers with the same `uniqueKey` (and `isolated === false`) share the same underlying store.                                          |
| `isolated`      | `boolean`          | `false`     | When `true`, this Provider is **not** registered in the global list, so `useNearestStore()` lookups from outside its subtree ignore it. Use for encapsulated widgets.               |
| `noCached`      | `boolean`          | `false`     | When `true`, the store is **not** reused from the module-level cache on remount, and the cache entry is dropped on unmount. The offline DB is always dropped on unmount regardless. |
| `models`        | `Model[]`          | `[]`        | Array of `Model` objects to register on mount.                                                                                                                                      |
| `offlineConfig` | `OfflineConfig`    | `{}`        | See [offlineConfig](#offlineconfig).                                                                                                                                                |
| `...rest`       | Any other props    |             | Treated as the initial `runtime_state`. A prop `{ foo: 1 }` becomes `state.foo = 1`.                                                                                                |

> ⚠️ Don't name an initial-state prop `models` — that prop is reserved.

```tsx
import React from 'react';
import Provider, { useDispatch, useModel } from 'dva-react-hook';

function App() {
  const [loginState] = useModel('login_model');
  const login = useDispatch({ type: 'login_model/login' });
  return loginState?.name ? (
    <div>
      <span>{loginState.name} has logged in</span>
      <span>sex: {loginState.sex}</span>
      <span>age: {loginState.age}</span>
    </div>
  ) : (
    <div>
      <span>nobody logged in</span>
      <button onClick={login}>Login</button>
    </div>
  );
}

const loginModel = {
  name: 'login_model',
  init: { name: null, sex: null, age: null },
  effects: {
    login: async ({ setState }) => {
      await loginService();
      setState({ name: 'lynn', sex: 'male', age: 22 });
    },
  },
};

ReactDOM.render(
  <Provider
    uniqueKey='namespace'
    noCached={true}
    isolated={false}
    offlineConfig={{
      offline: true,
      autoRecover: true,
      excludes: [],
      customizer: (objValue, srcValue) => undefined,
    }}
    count={0}
    models={[loginModel]}
  >
    <App />
  </Provider>,
  document.getElementById('root'),
);
```

### `offlineConfig`

Controls how state is persisted to IndexedDB / WebSQL / localStorage via
[localForage](https://github.com/localForage/localForage).

| Field         | Type                                               | Description                                                                                                                                                                  |
| ------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `offline`     | `boolean`                                          | Enable persistence. Every `modify` / `add` writes the top-level model's slice to storage.                                                                                    |
| `autoRecover` | `boolean`                                          | On mount, load all persisted slices and merge them into `runtime_state` **before** the `Provider` becomes visible. Without `autoRecover`, persisted values are written-only. |
| `excludes`    | `string[]`                                         | Paths to strip before writing to storage (e.g. `['user/token']`). The top-level model is still written; only the nested paths are scrubbed via a clone.                      |
| `customizer`  | `(objValue, srcValue, key, object, source) => any` | Passed to lodash's `mergeWith` when `autoRecover` merges persisted values over the current state. Return `undefined` to use the default merge.                               |

During persistence, values that can't be meaningfully serialised (functions,
DOM nodes, promises, workers, regex, symbols, weak-collections) are written
as `null`. `Date` values are written as timestamps; in-memory they remain
real `Date` instances.

#### Examples

**1. Plain auto-recovery** — rehydrate all slices from storage on startup:

```tsx
<Provider
  uniqueKey='app'
  models={[userModel, cartModel]}
  offlineConfig={{ offline: true, autoRecover: true }}
>
  <App />
</Provider>
```

**2. Exclude sensitive nested fields** — persist `user` but strip
`user/token` and `user/session/secret`:

```tsx
<Provider
  uniqueKey='app'
  models={[userModel]}
  offlineConfig={{
    offline: true,
    autoRecover: true,
    excludes: ['user/token', 'user/session/secret'],
  }}
>
  <App />
</Provider>
```

**3. Array-vs-array merge via `customizer`** — prefer the persisted list
over the default:

```tsx
const customizer = (objValue, srcValue) => {
  if (Array.isArray(srcValue)) return srcValue; // replace rather than concat
  return undefined;
};

<Provider
  uniqueKey='app'
  models={[favouritesModel]}
  offlineConfig={{ offline: true, autoRecover: true, customizer }}
>
  <App />
</Provider>;
```

**4. Direct access to the underlying `localforage` instance** from inside an
effect (e.g. to clear everything on logout):

```javascript
const userModel = {
  name: 'user',
  init: {},
  effects: {
    logout: async ({ setState, offlineInstance }) => {
      await offlineInstance.clear();
      setState({});
    },
  },
};
```

### `Dynamic`

Lazy-load a component and (optionally) its models.

| Prop           | Type                                                                                   | Description                               |
| -------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| `component`    | `() => Promise<{ default: React.ComponentType }>`                                      | Passed to `React.lazy`.                   |
| `models`       | `(() => ...) \| Array<Model \| Model[] \| Promise<Model \| Model[] \| DynamicModule>>` | Models to register before rendering.      |
| `renderBefore` | `() => void`                                                                           | Hook invoked before async loading starts. |
| `...rest`      | Any                                                                                    | Forwarded to the lazy component.          |

#### Examples

**1. Lazy-load a component only** — no extra models:

```tsx
import { Dynamic } from 'dva-react-hook';

<Dynamic component={() => import('./pages/Settings')} />;
```

**2. Lazy-load both models and the component**:

```tsx
<Dynamic
  models={() => [import('./models/user'), import('./models/post')]}
  component={() => import('./pages/Feed')}
/>
```

**3. Synchronous models, async component** — useful when the models are
cheap but the page is heavy:

```tsx
import userModel from './models/user';
import postModel from './models/post';

<Dynamic
  models={[userModel, postModel]}
  component={() => import('./pages/Feed')}
/>;
```

**4. Hook into the "before-load" moment** with `renderBefore`, e.g. to show
a progress bar or ping analytics:

```tsx
<Dynamic
  renderBefore={() => window.NProgress?.start()}
  component={() => import('./pages/Reports')}
/>
```

**5. Forward props to the lazy component** — anything beyond the known
props is passed straight through:

```tsx
<Dynamic component={() => import('./pages/User')} userId={42} readonly />
```

If loading fails the component keeps the state `{ loaded: false, error }`
so parents can render a fallback.

### `Model`

A Model is a plain object describing a slice of state plus the effects and
callbacks that operate on it.

```javascript
{
  name: 'some-name',
  init: Function | Object | Number | Array | ...,   // optional, default {}
  effects: {
    // An async function is recommended but not required.
    'some-effect-name': async (...args, helpers) => {
      // `helpers` is injected by the framework and is ALWAYS the last argument.
      // If you call the effect with extra positional arguments, list them BEFORE helpers:
      //   async (arg1, arg2, { state, setState, select, reference, getDispatch }) => {}
    },
  },
  callbacks: {
    // Optional; see the next section.
    'some-callback-name': ({ info, select, getDispatch }) => {},
  },
}
```

#### Helpers injected into effects

| Helper            | Signature                                                             | Notes                                                                                                               |
| ----------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `state`           | Any                                                                   | A **deep clone** of the model's current state when the effect started.                                              |
| `setState`        | `(data, { cancelUpdate?, callbacks?, referenced? }) => Promise<void>` | Writes `data` to this model. `cancelUpdate` suppresses re-renders; `referenced` skips the defensive clone on write. |
| `select`          | `(path, options?) => [value, setValue, getLatest]`                    | Same contract as `useModel`, but not a Hook.                                                                        |
| `reference`       | `(path, options?) => [value, setValue, getLatest]`                    | Like `select` but returns the live reference instead of a clone.                                                    |
| `getDispatch`     | `(action) => (...args) => Promise<any>`                               | Pure factory — build another model's effect dispatcher without calling a Hook.                                      |
| `offlineInstance` | `localforage` instance                                                | Direct access to the Provider's offline DB.                                                                         |

All extra properties you attached to the original `useDispatch({ type, ... })`
action are spread into `helpers` as well.

#### Examples

**1. Minimal model** — just a name and initial state:

```javascript
const counterModel = {
  name: 'counter',
  init: { value: 0 },
  effects: {
    increment: (_, { state, setState }) => {
      setState({ value: state.value + 1 });
    },
  },
};
```

**2. Lazy `init` via a factory** — runs at registration time:

```javascript
const sessionModel = {
  name: 'session',
  init: () => ({ startedAt: Date.now(), visitId: crypto.randomUUID() }),
  effects: {
    touch: (_, { state, setState }) =>
      setState({ ...state, lastAt: Date.now() }),
  },
};
```

**3. Async effect calling another model's dispatcher via `getDispatch`**:

```javascript
const checkoutModel = {
  name: 'checkout',
  init: { status: 'idle' },
  effects: {
    submit: async (cart, { setState, getDispatch }) => {
      setState({ status: 'loading' });
      const placeOrder = getDispatch({ type: 'orders/place' });
      const order = await placeOrder(cart);
      setState({ status: 'ok', orderId: order.id });
    },
  },
};
```

**4. Effect with positional args BEFORE helpers** (framework always
injects helpers last):

```javascript
const searchModel = {
  name: 'search',
  init: { keyword: '', results: [] },
  effects: {
    query: async (keyword, page, { setState }) => {
      const results = await api.search(keyword, page);
      setState({ keyword, results });
    },
  },
};

// Dispatch it with:
//   const run = useDispatch({ type: 'search/query' });
//   run('shoes', 1);
```

**5. Effect using `reference` to avoid a deep clone of a large blob**:

```javascript
const docModel = {
  name: 'doc',
  init: { buffer: new ArrayBuffer(0) },
  effects: {
    appendChunk: (chunk, { reference }) => {
      const [doc, setDoc] = reference('doc');
      const merged = new Uint8Array(doc.buffer.byteLength + chunk.byteLength);
      merged.set(new Uint8Array(doc.buffer), 0);
      merged.set(new Uint8Array(chunk), doc.buffer.byteLength);
      setDoc({ buffer: merged.buffer }, { referenced: true });
    },
  },
};
```

### `Model.callbacks`

Callbacks are named post-processing hooks triggered by `setState` (in an
effect) or by the setter returned from `useModel` / `useReference` via the
`callbacks` option. They receive:

```javascript
callbacks: {
  after({ info, select, getDispatch }) {
    // info.name  - the path that changed
    // info.value - { pre, current }  (from useModel / useReference setters)
    //              or the cloned state (from inside an effect)
  },
}
```

Trigger one callback by name or an array of names:

```javascript
setState({ count: 3 }, { callbacks: 'after' });
setState({ count: 3 }, { callbacks: ['after', 'track'] });
```

#### Examples

**1. Logging callback from inside an effect**:

```javascript
const cartModel = {
  name: 'cart',
  init: { items: [] },
  effects: {
    add: async (item, { state, setState }) => {
      await setState(
        { items: [...state.items, item] },
        { callbacks: 'logAdded' },
      );
    },
  },
  callbacks: {
    logAdded({ info, select }) {
      console.log('[cart] added', info.value, 'now:', select('cart')[0].items);
    },
  },
};
```

**2. Trigger callback from a component setter**:

```javascript
const [, setUser] = useModel('user');
setUser({ name: 'lynn' }, { callbacks: ['track', 'notifyServer'] });
// both callbacks run once the modify has been applied
```

**3. Callback dispatching another effect**:

```javascript
const userModel = {
  name: 'user',
  init: { name: '', loggedIn: false },
  effects: {
    login: async (credentials, { setState }) => {
      await setState(
        { ...credentials, loggedIn: true },
        { callbacks: 'onLogin' },
      );
    },
  },
  callbacks: {
    onLogin({ getDispatch }) {
      const loadCart = getDispatch({ type: 'cart/load' });
      loadCart();
    },
  },
};
```

### `connect`

A decorator / HOC for class components. Useful if you already have a
class-based codebase.

```javascript
import { connect } from 'dva-react-hook';

@connect('list/page', { name: 'dispatch1', action: { type: 'list/fetch' } })
@connect('property', { name: 'dispatch2', action: { type: 'space/fetch' } })
class Demo extends React.Component {
  // Injected props:
  //   listState / setList       (from the first connect)
  //   propertyState / setProperty (from the second connect)
  //   dispatch1, dispatch2
  render() {
    return <div />;
  }
}
```

Pass only the first argument if you need state without an action:

```javascript
@connect('user/profile')
class Profile extends React.Component {
  // Injected: userState, setUser
}
```

#### Plain-HOC form (no decorator support)

```javascript
import { connect } from 'dva-react-hook';

class List extends React.Component {
  render() {
    const { listState, setList, reload } = this.props;
    return (
      <div>
        <button onClick={reload}>reload</button>
        <ul>
          {listState.items.map((x) => (
            <li key={x.id}>{x.label}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default connect('list', {
  name: 'reload',
  action: { type: 'list/fetch' },
})(List);
```

### `useAdd`

Dynamically inject a new piece of state without declaring a full Model.

```javascript
import { useAdd } from 'dva-react-hook';

useAdd(name, initdata, once);
// name     - string path of the state to add
// initdata - object / primitive / factory function
// once     - when truthy, the add dispatch only runs on mount
```

#### Examples

**1. One-shot registration on mount** — typical use case:

```javascript
import { useAdd, useModel } from 'dva-react-hook';

function Counter() {
  useAdd('counter', { value: 0 }, true);
  const [counter, setCounter] = useModel('counter');
  return (
    <button onClick={() => setCounter({ value: counter.value + 1 })}>
      {counter.value}
    </button>
  );
}
```

**2. Factory init** — run code on registration to compute the default:

```javascript
useAdd('session', () => ({ startedAt: Date.now() }), true);
```

**3. Re-initialise when a prop changes** — drop `once` and let the effect
re-run whenever `name` flips:

```javascript
function TabState({ tabId }) {
  useAdd(`tabs/${tabId}`, { scroll: 0 }); // no `once` → re-runs on tabId change
  const [tab, setTab] = useModel(`tabs/${tabId}`);
  return (
    <Scroller value={tab.scroll} onChange={(v) => setTab({ scroll: v })} />
  );
}
```

### `useModel`

```ts
useModel<T>(name: string, cancelUpdate?: boolean, store?: Store, options?: GetOptions<T>)
  : [T, ModelSetter<T>, () => T];
```

Binds a component to the state at `name` and returns:

1. `value` – a **deep clone** of the current value (stable across renders when
   deeply equal).
2. `setValue(data, { cancelUpdate?, callbacks?, referenced? })` – writes back
   to the store.
3. `getLatest()` – reads the freshest value at call time (bypasses the
   render snapshot).

| Parameter      | Description                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `cancelUpdate` | When `true`, this component does **not** re-render on changes at `name`. Useful for write-only bindings. |
| `options`      | `{ autoCreate?, defaultValue?, referenced?, resetField?, resetValue? }`.                                 |

`autoCreate: true` with `defaultValue` lazily creates missing nested paths.
`resetField: true` with `resetValue` rewrites the stored value when its
current type doesn't match `resetValue`.

```javascript
import Provider, { useDispatch, useModel } from 'dva-react-hook';

function App() {
  const eat = useDispatch({ type: 'apple/eat' });
  const apple = useModel('apple')[0];

  return (
    <div>
      <span>there are {apple.count} apples</span>
      <button onClick={() => eat(1)}>eat one apple</button>
    </div>
  );
}

const appleModel = {
  name: 'apple',
  init: { count: 8 },
  effects: {
    eat: (num, { state, setState }) => {
      setState({ count: state.count - num }, { cancelUpdate: true });
    },
  },
};
```

#### More examples

**1. `cancelUpdate` — write-only binding**:

```javascript
// Subscribes to `apple/count` only for writing; this component won't
// re-render when the count changes elsewhere.
const [, setCount] = useModel('apple/count', true);
```

**2. `autoCreate` + `defaultValue` — lazy nested paths**:

```javascript
const [draft, setDraft] = useModel('forms/profile/draft', false, undefined, {
  autoCreate: true,
  defaultValue: { name: '', age: 0 },
});
// If `forms`, `forms.profile`, or `forms.profile.draft` don't exist yet,
// they're created automatically; reads never throw.
```

**3. `resetField` — coerce the stored value to a specific shape**:

```javascript
// If `settings/theme` is currently a string but we expect an object,
// it is rewritten with `resetValue` before the read returns.
const [theme] = useModel('settings/theme', false, undefined, {
  resetField: true,
  resetValue: { mode: 'light', accent: '#1677ff' },
});
```

**4. Using `getLatest()` for a fresh read inside a callback**:

```javascript
function Uploader() {
  const [, setFile, getLatest] = useModel('uploader/current');
  const upload = () => {
    const file = getLatest(); // avoids the render snapshot
    api.upload(file);
  };
  return <button onClick={upload}>Upload</button>;
}
```

**5. Targeting an explicit store** (e.g. inside an isolated widget):

```javascript
const store = useNearestStore();
const [value, setValue] = useModel('widget/state', false, store);
```

### `useReference`

```ts
useReference<T>(name: string, cancelUpdate?: boolean, options?: GetOptions & { store?: Store })
  : [T, ModelSetter<T>];
```

Like `useModel` but returns the **live reference** — no deep clone is made.
Mutating the returned value mutates the store directly (you still need to
call the setter to trigger re-renders). Use for very large blobs / binary
data where cloning is too expensive.

```javascript
import { useReference } from 'dva-react-hook';

function Editor() {
  const [doc, setDoc] = useReference('editor/document');
  return (
    <textarea
      value={doc.text}
      onChange={(e) => setDoc({ ...doc, text: e.target.value })}
    />
  );
}
```

#### More examples

**1. Binary blob** — keep the `ArrayBuffer` as-is and avoid cloning:

```javascript
function VideoPreview() {
  const [video] = useReference('upload/videoBlob');
  const url = React.useMemo(
    () => (video ? URL.createObjectURL(new Blob([video])) : null),
    [video],
  );
  return url ? <video src={url} controls /> : null;
}
```

**2. Write-only reference binding** — skip re-renders but still mutate:

```javascript
const [, setCanvas] = useReference('canvas/pixels', true);
setCanvas(newPixelBuffer, { referenced: true });
```

**3. Pairing with `useObserver`** — subscribe to change notifications
without re-rendering from the reference:

```javascript
const [data] = useReference('huge/dataset', true); // don't re-render
useObserver('huge/dataset', (cur) => {
  // custom rendering logic, e.g. repaint a chart imperatively
  chartRef.current?.setData(cur);
});
```

### `useDispatch`

`useDispatch(action)` returns the dispatcher function for a registered
effect. `action` must be an object with a `type` of the form
`'<model>/<effect>'`. Any extra properties on `action` are forwarded to the
effect's `helpers` argument.

```javascript
const loginaction = useDispatch({ type: 'login/login', role: 'admin' });

// Inside the model:
// async login({ name, pass }, { state, setState, select, getDispatch, reference, role }) {}

loginaction({ name, pass })
  .then((data) => {
    /* ... */
  })
  .catch((error) => {
    /* ... */
  })
  .finally(() => {
    /* ... */
  });
```

#### More examples

**1. Fire-and-forget action**:

```javascript
function Ping() {
  const ping = useDispatch({ type: 'diag/ping' });
  return <button onClick={() => ping()}>ping</button>;
}
```

**2. Passing extra context through the action** — it appears in `helpers`:

```javascript
function DeleteButton({ rowId, reason }) {
  const remove = useDispatch({ type: 'rows/delete', reason });
  return <button onClick={() => remove(rowId)}>delete</button>;
}

// In the model:
const rowsModel = {
  name: 'rows',
  effects: {
    delete: async (id, { state, setState, reason }) => {
      await api.delete(id, { reason });
      setState({ ...state, items: state.items.filter((x) => x.id !== id) });
    },
  },
};
```

**3. Awaiting the result**:

```javascript
function Checkout() {
  const submit = useDispatch({ type: 'checkout/submit' });
  const onClick = async () => {
    try {
      const order = await submit({ cartId: 'abc' });
      toast.success(`order ${order.id} placed`);
    } catch (e) {
      toast.error(e.message);
    }
  };
  return <button onClick={onClick}>Place order</button>;
}
```

**4. Using an explicit store** — e.g. when the dispatcher is created outside
the Provider subtree:

```javascript
function useAwayDispatch(action) {
  const store = useNearestStore();
  return useDispatch({ ...action, store });
}
```

### `useChange`

```ts
useChange(
  callback: (event: ChangeEvent) => void,
  dependencies?: React.DependencyList,
  options?: { store?: Store; others?: string[] },
): void;
```

Subscribes to **every** state change in the current store. The callback is
debounced (300 ms) per changed path. `event` has the shape:

| Field            | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| `actiontype`     | Underlying action type (`'add'` / `'modify'`).                       |
| `name`           | Path that changed (e.g. `'user/profile'`).                           |
| `currentvalue`   | New value at that path.                                              |
| `prevalue`       | Previous value at that path.                                         |
| `otherprevalues` | Snapshot of the paths listed in `options.others` (as of pre-change). |
| `currentstore`   | Reference to `store.runtime_state` at callback time.                 |

```javascript
useChange(
  ({ actiontype, name, currentvalue, prevalue, otherprevalues }) => {
    console.log(actiontype, name, prevalue, '->', currentvalue);
  },
  [],
  { others: ['user/profile'] },
);
```

#### More examples

**1. Global change logger** — mount once near the root:

```javascript
function DevLogger() {
  useChange(({ actiontype, name, prevalue, currentvalue }) => {
    console.debug('[store]', actiontype, name, { prevalue, currentvalue });
  });
  return null;
}
```

**2. Reactive persistence** — mirror all changes to a remote server:

```javascript
useChange(async ({ name, currentvalue }) => {
  await fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify({ path: name, value: currentvalue }),
  });
});
```

**3. Correlated snapshot with `options.others`** — capture other paths'
values as they were **before** the change:

```javascript
useChange(
  ({ name, currentvalue, otherprevalues }) => {
    // otherprevalues keeps the pre-change snapshot of user/profile
    audit({
      path: name,
      after: currentvalue,
      contextBefore: otherprevalues,
    });
  },
  [],
  { others: ['user/profile', 'session/current'] },
);
```

**4. Re-subscribe when a dep changes**:

```javascript
function Watcher({ userId }) {
  useChange(
    ({ name }) => {
      if (name.startsWith(`users/${userId}`))
        analytics.track('user-change', userId);
    },
    [userId],
  );
  return null;
}
```

### `useObserver`

```ts
useObserver(
  path: string,
  callback: Function,
  dependencies?: React.DependencyList,
  store?: Store,
): void;
```

Subscribe to a single path. The callback signature depends on where the
change occurred relative to `path`:

1. **Change at exactly `path`**
   ```js
   (currentValue, previousValue, actionType) => void
   ```
2. **Change at a descendant of `path`** (parent subscription)
   ```js
   (parentCurrentValue, {
     path: string[],     // the full path that actually changed
     value: any,         // new value at that deep path
     prevalue: any,      // previous value at that deep path
     actiontype: string, // 'add' | 'modify'
   }) => void
   ```
3. **Change at an ancestor of `path`** (child subscription)
   ```js
   (currentAtPath, previousAtPath, actionType) => void
   ```

```javascript
useObserver('user/profile', (current, previous, actionType) => {
  console.log(current, previous, actionType);
});

useObserver('user', (currentUser, diff) => {
  // diff = { path, value, prevalue, actiontype }  when a descendant changes
});
```

#### More examples

**1. Exact-path listener** — react to changes at one specific key:

```javascript
function ThemeBridge() {
  useObserver('settings/theme', (current) => {
    document.documentElement.dataset.theme = current.mode;
  });
  return null;
}
```

**2. Parent subscription** — observe any descendant change under `cart/items`:

```javascript
useObserver('cart/items', (currentItems, diff) => {
  if (diff && diff.path) {
    console.log('cart deep change at', diff.path.join('/'), '=', diff.value);
  } else {
    console.log('cart replaced:', currentItems);
  }
});
```

**3. Child subscription** — observe a nested key whose ancestor is the one
actually being replaced:

```javascript
// Any write on `user` (including wholesale replacement) will trigger this
// with the slice at `user/profile`.
useObserver('user/profile', (profile, previous, actionType) => {
  cache.set('profile', profile);
});
```

**4. Subscribe with dependency refresh** — re-bind when `id` changes:

```javascript
function Row({ id }) {
  useObserver(`rows/${id}`, (cur) => console.log('row', id, cur), [id]);
  return null;
}
```

**5. Targeting an explicit store** — fourth arg:

```javascript
const store = useNearestStore();
useObserver('widget/internal', handler, [], store);
```

### `useNearestStore`

```ts
useNearestStore(): Store | undefined;
```

Resolves the store exposed by the nearest `Provider`. Rarely needed in app
code — use it when writing custom hooks that need direct access to
`runtime_state`, `dispatch`, or the subscription maps.

Returns `undefined` when there is no ancestor Provider.

#### Examples

**1. Assert a Provider exists** — fail loudly instead of silently:

```javascript
function useStoreOrThrow() {
  const store = useNearestStore();
  if (!store) throw new Error('Missing <Provider>');
  return store;
}
```

**2. Build a bespoke selector hook** on top of the raw store:

```javascript
import { useNearestStore, get } from 'dva-react-hook';

export function useWhole() {
  const store = useNearestStore();
  return store?.runtime_state;
}

export function useLatestGetter(path) {
  const store = useNearestStore();
  const [, , getLatest] = get(path, store);
  return getLatest;
}
```

**3. Bypass the nearest-lookup when passing store explicitly**:

```javascript
function BridgeToChild({ children }) {
  const parentStore = useNearestStore();
  // children can forward `parentStore` via context / props if they need
  // access to it from inside an isolated sub-Provider.
  return children(parentStore);
}
```

### Utility exports

| Export                                | Description                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `clone(value, offline?)`              | Deep clone built on `lodash.cloneDeepWith`. `offline=true` drops non-serialisable values. |
| `get(name, store, options?)`          | Non-Hook version of `useModel`. Returns `[value, setValue, getLatest]`.                   |
| `getPathArray(path)`                  | Cached split of `'a/b/c'` into `['a','b','c']`.                                           |
| `checkPrefixRelation(prefix, target)` | Returns `true` when `prefix` is a (non-strict) prefix of `target`.                        |

#### Examples

**1. `clone` — deep copy safely, with offline sanitisation**:

```javascript
import { clone } from 'dva-react-hook';

const copy = clone({ createdAt: new Date(), fn: () => 1 });
// copy.createdAt is still a `Date`
// copy.fn       === fn (function preserved)

const wire = clone({ createdAt: new Date(), fn: () => 1 }, true);
// wire.createdAt is a number (timestamp)
// wire.fn       === null (non-serialisable stripped)
```

**2. `get` — non-Hook read/write** (safe to call from any context):

```javascript
import { useNearestStore, get } from 'dva-react-hook';

function useLatestCount() {
  const store = useNearestStore();
  const [, , getLatest] = get('counter/value', store);
  return getLatest;
}

function useSyncMirror() {
  const store = useNearestStore();
  return (value) => {
    const [, setValue] = get('mirror/value', store);
    setValue(value);
  };
}
```

**3. `getPathArray` — cached path splitting**:

```javascript
import { getPathArray } from 'dva-react-hook';

getPathArray('user/profile/name'); // ['user', 'profile', 'name']
getPathArray('user/profile/'); // ['user', 'profile']  (trailing slash stripped)
```

**4. `checkPrefixRelation` — is A a prefix of B?**:

```javascript
import { checkPrefixRelation, getPathArray } from 'dva-react-hook';

const a = getPathArray('user');
const b = getPathArray('user/profile/name');

checkPrefixRelation(a, b); // true
checkPrefixRelation(b, a); // false
checkPrefixRelation(a, a); // true  (non-strict)
```

## TypeScript

Type definitions ship in [`types/index.d.ts`](./types/index.d.ts) and are
exposed via `package.json`'s `types` field. All hooks, `Provider`,
`Dynamic`, `connect`, and the `Model` / `EffectHelpers` / `CallbackHelpers`
interfaces are generic and strongly typed:

```ts
import Provider, {
  useModel,
  useDispatch,
  Model,
  ModelSetter,
} from 'dva-react-hook';

interface UserState {
  name: string;
  age: number;
}

const userModel: Model<UserState> = {
  name: 'user',
  init: { name: '', age: 0 },
  effects: {
    login: async ({ name, pass }: { name: string; pass: string }, { setState }) => {
      setState({ name, age: 18 });
    },
  },
};

function Profile() {
  const [user, setUser]: [UserState, ModelSetter<UserState>] = useModel<UserState>('user');
  const login = useDispatch<[{ name: string; pass: string }], Promise<void>>({
    type: 'user/login',
  });
  return <button onClick={() => login({ name: 'lynn', pass: 'x' })}>{user.name}</button>;
}
```

## License

MIT
