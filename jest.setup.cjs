if (typeof global.Worker === 'undefined') {
  global.Worker = class Worker {};
}

if (typeof global.Node === 'undefined') {
  global.Node = class Node {};
}

if (typeof global.Event === 'undefined') {
  global.Event = class Event {};
}

if (typeof global.window === 'undefined') {
  global.window = {};
}

if (typeof global.performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
  };
}

if (!global.window.performance) {
  global.window.performance = global.performance;
}
