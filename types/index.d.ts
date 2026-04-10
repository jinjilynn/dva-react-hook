import * as React from 'react';

export type Path = string;
export type CallbackNames = string | string[];

export interface OfflineConfig {
  offline?: boolean;
  autoRecover?: boolean;
  excludes?: string[];
  customizer?: (...args: any[]) => any;
}

export interface GetOptions<T = any> {
  autoCreate?: boolean;
  defaultValue?: T;
  referenced?: boolean;
  resetField?: boolean;
  resetValue?: unknown;
}

export interface SetStateOptions {
  cancelUpdate?: boolean;
  callbacks?: CallbackNames;
  referenced?: boolean;
}

export interface ChangeEvent<TCurrent = any, TPrevious = any, TOther = any> {
  actiontype: string;
  name: string;
  currentvalue: TCurrent;
  prevalue: TPrevious;
  otherprevalues?: TOther;
  currentstore: Record<string, any>;
}

export interface InternalAction {
  type: string;
  name: string;
  data?: any;
  initdate?: any;
  inner?: symbol;
  cancelUpdate?: boolean;
  referenced?: boolean;
}

export interface DispatchAction {
  type: string;
  store?: Store;
  [key: string]: any;
}

export interface RefreshCacheEntry {
  _s: string;
  set: React.Dispatch<React.SetStateAction<string>>;
}

export interface OfflineInstance {
  dropInstance?(): Promise<any>;
  setItem(key: string, value: any): Promise<any>;
  getItem?(key: string): Promise<any>;
  iterate?<T>(
    iterator: (value: T, key: string, iterationNumber: number) => void,
  ): Promise<any>;
  keys(): Promise<string[]>;
  [key: string]: any;
}

export interface Store {
  offline: boolean;
  offlineInstance: OfflineInstance;
  offlineExcludes: string[];
  dispatch?: (action: InternalAction) => Promise<void>;
  inner: symbol;
  MODELS: Record<string, Model<any>>;
  REFRESH_CACHE: Record<string, RefreshCacheEntry>;
  REDUCER?: (action: InternalAction) => Promise<void>;
  isDispatching: {
    dispatching: boolean;
    name: string | null;
  };
  runtime_state: Record<string, any>;
  dispatch_queue: Array<{
    uid: string;
    action: InternalAction;
  }>;
  dispatchPromise: Promise<void> | null;
  changeSubscribes: Record<string, (event: ChangeEvent) => void>;
  observerSubscribes: Record<string, Record<string, (...args: any[]) => void>>;
  debounceTimers: Map<string, ReturnType<typeof setTimeout>>;
  previousStateMap: Map<string, any>;
  currentStateMap: Map<string, any>;
  onChangeOtherProps: Record<string, string[]>;
  [key: string]: any;
}

export type ModelSetter<T = any> = (
  value: T,
  options?: SetStateOptions,
) => Promise<void>;

export type ModelSelectorResult<T = any> = [T, ModelSetter<T>, () => T];

export interface EffectHelpers<TState = any> {
  state: TState;
  setState: ModelSetter<TState>;
  select: <T = any>(
    name: Path,
    options?: GetOptions<T>,
  ) => ModelSelectorResult<T>;
  reference: <T = any>(
    name: Path,
    options?: Omit<GetOptions<T>, 'referenced'>,
  ) => ModelSelectorResult<T>;
  getDispatch: <TArgs extends unknown[] = any[], TResult = any>(
    action: DispatchAction,
  ) => (...args: TArgs) => TResult;
  offlineInstance: OfflineInstance;
  [key: string]: any;
}

export type ModelEffect<
  TState = any,
  TArgs extends unknown[] = any[],
  TResult = any,
  TExtra extends object = Record<string, unknown>,
> = (...args: [...TArgs, EffectHelpers<TState> & TExtra]) => TResult;

export interface CallbackHelpers {
  info: any;
  select: <T = any>(
    name: Path,
    options?: GetOptions<T>,
  ) => ModelSelectorResult<T>;
  getDispatch: <TArgs extends unknown[] = any[], TResult = any>(
    action: DispatchAction,
  ) => (...args: TArgs) => TResult;
}

export type ModelCallbacks = Record<string, (helpers: CallbackHelpers) => void>;

export interface Model<
  TState = any,
  TEffects extends Record<string, ModelEffect<TState, any[], any, any>> =
    Record<string, ModelEffect<TState, any[], any, any>>,
  TCallbacks extends ModelCallbacks = ModelCallbacks,
> {
  name: string;
  init?: TState | (() => TState);
  effects?: TEffects;
  callbacks?: TCallbacks;
  [key: string]: any;
}

export interface ProviderProps {
  isolated?: boolean;
  uniqueKey?: string | number;
  models?: Model[];
  offlineConfig?: OfflineConfig;
  noCached?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

export interface UseChangeOptions {
  store?: Store;
  others?: string[];
}

export interface DynamicModule {
  default?: Model | Model[];
}

export type DynamicModelResource = Model | Model[] | DynamicModule;

export type DynamicModelsProp =
  | (() => DynamicModelResource | Promise<DynamicModelResource>)
  | Array<DynamicModelResource | Promise<DynamicModelResource>>;

export interface DynamicProps {
  models?: DynamicModelsProp;
  renderBefore?: () => void;
  component: () => Promise<{
    default: React.ComponentType<any>;
  }>;
  [key: string]: any;
}

export interface ConnectActionConfig<TName extends string = string> {
  name: TName;
  action: DispatchAction;
}

export type ConnectedStateProps<TModel extends string, TState> = Record<
  `${TModel}State`,
  TState
> &
  Record<`set${TModel}`, ModelSetter<TState>>;

export type ConnectedActionProps<
  TName extends string,
  TArgs extends unknown[] = any[],
  TResult = any,
> = Record<TName, (...args: TArgs) => TResult>;

declare const Provider: React.FC<ProviderProps>;

export default Provider;

export function connect<
  TModel extends string,
  TState = any,
  TActionName extends string = string,
  TArgs extends unknown[] = any[],
  TResult = any,
  P extends object = {},
>(
  model: TModel,
  action: ConnectActionConfig<TActionName>,
): (
  Component: React.ComponentType<
    P &
      ConnectedStateProps<TModel, TState> &
      ConnectedActionProps<TActionName, TArgs, TResult>
  >,
) => React.FC<P>;

export function connect<
  TModel extends string,
  TState = any,
  P extends object = {},
>(
  model: TModel,
): (
  Component: React.ComponentType<P & ConnectedStateProps<TModel, TState>>,
) => React.FC<P>;

export const Dynamic: React.FC<DynamicProps>;

export function useAdd<T = any>(
  name: Path,
  initdata: T | (() => T),
  once?: boolean,
): void;

export function useDispatch<TArgs extends unknown[] = any[], TResult = any>(
  action: DispatchAction,
): (...args: TArgs) => TResult;

export function useModel<T = any>(
  name: Path,
  cancelUpdate?: boolean,
  store?: Store,
  options?: GetOptions<T>,
): ModelSelectorResult<T>;

export function useChange(
  callback: (event: ChangeEvent) => void,
  dependencies?: React.DependencyList,
  options?: UseChangeOptions,
): void;

export function useObserver(
  path: Path,
  callback: (...args: any[]) => void,
  dependencies?: React.DependencyList,
  store?: Store,
): void;

export function useReference<T = any>(
  name: Path,
  cancelUpdate?: boolean,
  options?: GetOptions<T> & { store?: Store },
): [T, ModelSetter<T>];

export function useNearestStore(): Store | undefined;

export function checkPrefixRelation(
  prearray: string[],
  currentarray: string[],
): boolean;

export function getPathArray(path: Path): string[];

export function clone<T>(value: T, offline?: boolean): T;

export function get<T = any>(
  name: Path,
  store: Store,
  options?: GetOptions<T>,
): ModelSelectorResult<T>;
