'use strict';

function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}
function ael(x, type, fn) {
  const f = e => {
    e.preventDefault();
    fn.bind(x)();
  }
  const element = typeof x === 'object' ? x : qs(x);
  element.addEventListener(type, f);
}
function aelo(x, type, fn) {
  const f = e => {
    e.preventDefault();
    fn.bind(x)();
  }
  const element = typeof x === 'object' ? x : qs(x);
  element.addEventListener(type, f, {once: true});
}

// Polyfill
if (! Array.prototype.at) {
  function at(n) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  }
  Object.defineProperty(Array.prototype, 'at', {
    value: at,
  });
}
