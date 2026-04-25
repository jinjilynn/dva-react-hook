# Changelog for dva-react-hook

## 2.7.3

- feat: export `getStoreByUniqueKey(uniqueKey)` — a non-Hook lookup that
  returns the cached store for a given `<Provider uniqueKey>`, so app code
  outside the React tree (HTTP interceptors, services, etc.) can dispatch /
  read state without a Hook. Unlike the internal `getStoreByKey`, this does
  **not** evict the entry from the cache.

## 2.7.2

- refactor: migrate `useModel` and `useReference` subscriptions to
  `useSyncExternalStore` (via `use-sync-external-store/shim` for React 16.8+
  compatibility), making re-renders tear-free and fully concurrent-mode safe.
  `REFRESH_CACHE` entries are now `{ _s, version, listener }` and the reducer
  bumps `version` + invokes `listener()` on matching path changes; the legacy
  `set(nanoid())` call is preserved for backwards compatibility with any
  external consumers of the cache shape.

## 2.7.1

- fix: `useAdd` dependency array bug that triggered an infinite dispatch loop
  when `once` was falsy
- fix: `useNearestStore` violated the Rules of Hooks by calling `useContext`
  inside a loop with an early `break`; it now snapshots the provider list
  with `useRef` and calls `useContext` unconditionally
- fix: replace `window`-based store cache with a module-level `Map`
  (`setStoreByKey` / `deleteStoreByKey` / `getStoreByKey`) — SSR safe and no
  more cross-instance bleed
- fix: `Provider` recovery path now re-checks the `unmounted` flag after every
  `await`, avoiding state updates on an unmounted component
- fix: `Provider` unmount now clears pending `debounceTimers`,
  `previousStateMap`, and `currentStateMap` so stale timers can't fire
- fix: `clone` preserves the `Date` type in-memory; timestamps are only used
  for the offline-serialisation path
- fix: `Dynamic` now records load errors (`{ loaded: false, error }`) instead
  of staying in a permanent loading state
- refactor: extract pure `makeDispatcher(action, store)` from `useDispatch`;
  `getDispatch` in effects and `executeCallback` in callbacks now call the
  factory directly and no longer violate the Rules of Hooks
- docs: rewritten README / DOCUMENTATION, documented `useNearestStore`,
  `clone`, `get`, `getPathArray`, `checkPrefixRelation`, `Model.callbacks`,
  `offlineConfig`, and TypeScript usage

## 2.7.0

- improve dispatch ordering, observer subscriptions, and Provider cleanup
- add `isolated` prop to Provider

## 2.6.x

- fix reducer change-call and change-subscriber ordering
- fix observe call path
- refactor `useChange`
- add `useReference`
- general performance improvements

## 2.5.x

- export `clone`
- add `useObserver`
- expose `offlineInstance` to dispatch effects
- add previous-state snapshot for `useChange`
- add `dependencies` param to `useChange`
- reset field when `defaultValue` type differs from the existing value
- add `isCopyMeaningless` guard in clone
- `useModel` memoisation via deep equality

## 2.4.x

- ⚠️ `2.4.0` is deprecated due to an emergency defect — use `2.4.1+`
- `useNearestStore` introduced
- reduce waiting time for the "once" update
- various optimisations

## 2.3.x

- add `getDispatch` for callbacks
- speed up response action
- change persistence to async
- third returned value for `select` / `useModel` (getLatest)
- add `autoCreate` for `useModel` / `select`
- update `onChange` callback signature
- add `useChange`

## 2.2.x

- nested Provider support (you can skip one Provider)
- add out-of-Provider parameter for `useModel`
- add `getDispatch` in effect helpers
- add `customizer` prop for `mergeWith`
- ensure setState ordering
- fix re-render when parent state changes but child listener is on a nested key
- dynamic `useModel`
- reducer refactor

## 1.3.3

- add uniqueKey in Provider

## 1.3.2

- add queue caching dispatch when multiple dispatchs are triggered simulaneously

## 1.3.0

- sharing state when call Provider in different palces in different projects

## 1.2.9

- sharing state when call Provider in different palces in the same project

## 1.2.8

- Fix the problem of state loss when you use Provider multiple times

## 1.2.6

- polyfilled

## 1.2.5

- reduce volume

## 1.2.4

- Optimising connect

## 1.2.3

- add clone

## 1.2.2

- add second parameter to useModel

## 1.2.1

- bug when the entire state is updated, the component that registered the local property of the state is not updated.

## 1.2.0

- add callbacks after set state, and change parameter form of useModel

## 1.1.9

- remove the function instead of an argument

## 1.1.8

- add function that updates the model and does not cause an update of the corresponding component

## 1.1.7

- bug state immutable

## 1.1.6

## 1.1.5

Aug 8, 2019

- optimized

## 1.1.4

Aug 7, 2019

- fix export default is Provider

## 1.1.3

Aug 7, 2019

- bug fix: useAdd and connect not work

## 1.1.2

Aug 6, 2019

- bug fix: require not work

## 1.1.1

## 1.1.0

## 1.0.9

## 1.0.8

## 1.0.7

## 1.0.6

## 1.0.5

- from this version is statble

## 1.0.4

- please dont download the versions below this

## 1.0.3

## 1.0.2

## 1.0.1

## 1.0.0
