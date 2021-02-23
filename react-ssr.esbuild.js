(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __commonJS = (callback, module) => () => {
    if (!module) {
      module = {exports: {}};
      callback(module.exports, module);
    }
    return module.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {get: all[name], enumerable: true});
  };
  var __exportStar = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module) => {
    if (module && module.__esModule)
      return module;
    return __exportStar(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", {value: module, enumerable: true})), module);
  };

  // packages/store/index.ts
  var require_store = __commonJS((exports) => {
    __markAsModule(exports);
    __export(exports, {
      createStore: () => createStore,
      useStore: () => useStore,
      useStoreFuncs: () => useStoreFuncs,
      useStoreSetState: () => useStoreSetState,
      useStoreState: () => useStoreState
    });
  });

  // react-ssr.js
  var React2 = require("react");
  var ReactDOMServer = require("react-dom/server");

  // packages/store/createStore.ts
  var React = __toModule(require("react"));

  // packages/store/key.ts
  var key_default = {};

  // packages/store/utils.ts
  function freezeOnce(value) {
    if (typeof value !== "object")
      return value;
    return !Object.isFrozen(value) ? value : Object.freeze(value);
  }
  function testStore(store2) {
    const ok = typeof store2 === "object" && store2?.type === key_default;
    return ok;
  }

  // packages/store/createStore.ts
  var errBadStoreFromCaller = (caller) => `${caller}: Bad store. Use 'createStore(initialStateOrInitializer)' to create a new store and then 'const [state, setState] = useStore(store)'.`;
  var errBadFuncsCreatorFromCaller = (caller) => `${caller}: Bad createFuncs. Use 'const createFuncs = state => ({ increment() { return state + 1 } })' and then 'const [state, funcs] = useStoreFuncs(store, createFuncs)'.`;
  var createStore = (initialState, initializer) => {
    const subscriptions = new Set();
    let state;
    if (typeof initializer === "function") {
      state = freezeOnce(initializer(initialState));
    } else {
      state = freezeOnce(initialState);
    }
    return {type: key_default, subscriptions, initialState: state, cachedState: state};
  };
  function useStoreImpl(caller, store2, createFuncs) {
    React.useCallback(() => {
      if (!testStore(store2)) {
        throw new Error(errBadStoreFromCaller(caller));
      }
      if (typeof createFuncs !== void 0 && typeof createFuncs !== "function") {
        throw new Error(errBadFuncsCreatorFromCaller(caller));
      }
    }, []);
    const [state, setState] = React.useState(store2.cachedState);
    const frozenState = freezeOnce(state);
    React.useEffect(() => {
      store2.subscriptions.add(setState);
      return () => {
        store2.subscriptions.delete(setState);
      };
    }, []);
    const setStateStore = React.useCallback((updater) => {
      const nextFrozenState = freezeOnce(typeof updater === "function" ? updater(store2.cachedState) : updater);
      store2.cachedState = nextFrozenState;
      setState(nextFrozenState);
      for (const set of store2.subscriptions) {
        if (set !== setState) {
          set(nextFrozenState);
        }
      }
    }, []);
    const funcKeys = React.useMemo(() => {
      if (createFuncs === void 0) {
        return void 0;
      }
      return Object.keys(createFuncs(frozenState));
    }, []);
    let funcs;
    if (createFuncs !== void 0 && funcKeys !== void 0) {
      funcs = funcKeys.reduce((accum, type) => {
        accum[type] = (...args) => {
          const nextState = createFuncs(frozenState)[type](...args);
          setStateStore(nextState);
          return nextState;
        };
        return accum;
      }, {});
    }
    if (funcs === void 0) {
      return [frozenState, setStateStore];
    }
    return [frozenState, funcs];
  }
  var useStore = (store2) => {
    return useStoreImpl("useStore", store2);
  };
  var useStoreState = (store2) => {
    return useStoreImpl("useStoreState", store2)[0];
  };
  var useStoreSetState = (store2) => {
    return useStoreImpl("useStoreSetState", store2)[1];
  };
  var useStoreFuncs = (store2, createFuncs) => {
    return useStoreImpl("useStoreFuncs", store2, createFuncs);
  };

  // react-ssr.js
  var store = require_store();
  function Component() {
    const name = "yolo";
    React2.useEffect(() => {
      console.log(`Hello, ${name}!`);
    }, [name]);
    return React2.createElement("h1", null, "Hello, world!");
  }
  console.log({out: ReactDOMServer.renderToStaticMarkup(React2.createElement(Component))});
  console.log({out: ReactDOMServer.renderToString(React2.createElement(Component))});
})();
