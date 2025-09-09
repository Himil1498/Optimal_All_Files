// /**
//  * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
//  * have elapsed since the last time the debounced function was invoked.
//  * @param {Function} func The function to debounce
//  * @param {number} wait The number of milliseconds to delay
//  * @param {Object} options The options object
//  * @param {boolean} [options.leading=false] Specify invoking on the leading edge of the timeout
//  * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's invoked
//  * @returns {Function} Returns the new debounced function
//  */
// export function debounce(func, wait, options = {}) {
//   let lastArgs,
//     lastThis,
//     maxWait,
//     result,
//     timerId,
//     lastCallTime,
//     lastInvokeTime = 0,
//     leading = false,
//     maxing = false,
//     trailing = true;

//   if (typeof func !== 'function') {
//     throw new TypeError('Expected a function');
//   }
//   wait = +wait || 0;
//   if (typeof options === 'object') {
//     leading = !!options.leading;
//     maxing = 'maxWait' in options;
//     maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
//     trailing = 'trailing' in options ? !!options.trailing : trailing;
//   }

//   function invokeFunc(time) {
//     const args = lastArgs;
//     const thisArg = lastThis;

//     lastArgs = lastThis = undefined;
//     lastInvokeTime = time;
//     result = func.apply(thisArg, args);
//     return result;
//   }

//   function startTimer(pendingFunc, wait) {
//     return setTimeout(pendingFunc, wait);
//   }

//   function leadingEdge(time) {
//     // Reset any `maxWait` timer.
//     lastInvokeTime = time;
//     // Start the timer for the trailing edge.
//     timerId = startTimer(timerExpired, wait);
//     // Invoke the leading edge.
//     return leading ? invokeFunc(time) : result;
//   }

//   function remainingWait(time) {
//     const timeSinceLastCall = time - lastCallTime;
//     const timeSinceLastInvoke = time - lastInvokeTime;
//     const timeWaiting = wait - timeSinceLastCall;

//     return maxing
//       ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
//       : timeWaiting;
//   }

//   function shouldInvoke(time) {
//     const timeSinceLastCall = time - lastCallTime;
//     const timeSinceLastInvoke = time - lastInvokeTime;

//     // Either this is the first call, activity has stopped and we're at the
//     // trailing edge, the system time has gone backwards and we're treating
//     // it as the trailing edge, or we've hit the `maxWait` limit.
//     return (
//       lastCallTime === undefined ||
//       timeSinceLastCall >= wait ||
//       timeSinceLastCall < 0 ||
//       (maxing && timeSinceLastInvoke >= maxWait)
//     );
//   }

//   function timerExpired() {
//     const time = Date.now();
//     if (shouldInvoke(time)) {
//       return trailingEdge(time);
//     }
//     // Restart the timer.
//     timerId = startTimer(timerExpired, remainingWait(time));
//   }

//   function trailingEdge(time) {
//     timerId = undefined;

//     // Only invoke if we have `lastArgs` which means `func` has been
//     // debounced at least once.
//     if (trailing && lastArgs) {
//       return invokeFunc(time);
//     }
//     lastArgs = lastThis = undefined;
//     return result;
//   }

//   function cancel() {
//     if (timerId !== undefined) {
//       clearTimeout(timerId);
//     }
//     lastInvokeTime = 0;
//     lastArgs = lastCallTime = lastThis = timerId = undefined;
//   }

//   function flush() {
//     return timerId === undefined ? result : trailingEdge(Date.now());
//   }

//   function pending() {
//     return timerId !== undefined;
//   }

//   function debounced(...args) {
//     const time = Date.now();
//     const isInvoking = shouldInvoke(time);

//     lastArgs = args;
//     lastThis = this;
//     lastCallTime = time;

//     if (isInvoking) {
//       if (timerId === undefined) {
//         return leadingEdge(lastCallTime);
//       }
//       if (maxing) {
//         // Handle invocations in a tight loop.
//         timerId = startTimer(timerExpired, wait);
//         return invokeFunc(lastCallTime);
//       }
//     }
//     if (timerId === undefined) {
//       timerId = startTimer(timerExpired, wait);
//     }
//     return result;
//   }

//   debounced.cancel = cancel;
//   debounced.flush = flush;
//   debounced.pending = pending;
//   return debounced;
// }

// /**
//  * Memoize a function with a custom resolver
//  * @param {Function} func The function to memoize
//  * @param {Function} [resolver] The function to resolve the cache key
//  * @returns {Function} Returns the new memoized function
//  */
// export function memoize(func, resolver) {
//   if (typeof func !== 'function' || (resolver != null && typeof resolver !== 'function')) {
//     throw new TypeError('Expected a function');
//   }
//   const memoized = function(...args) {
//     const key = resolver ? resolver.apply(this, args) : args[0];
//     const cache = memoized.cache;

//     if (cache.has(key)) {
//       return cache.get(key);
//     }
//     const result = func.apply(this, args);
//     memoized.cache = cache.set(key, result) || cache;
//     return result;
//   };
//   memoized.cache = new (memoize.Cache || Map)();
//   return memoized;
// }

// memoize.Cache = Map;

// /**
//  * Throttle a function to be called at most once per `wait` milliseconds
//  * @param {Function} func The function to throttle
//  * @param {number} wait The number of milliseconds to throttle invocations to
//  * @param {Object} [options={}] The options object
//  * @param {boolean} [options.leading=true] Specify invoking on the leading edge of the timeout
//  * @param {boolean} [options.trailing=true] Specify invoking on the trailing edge of the timeout
//  * @returns {Function} Returns the new throttled function
//  */
// export function throttle(func, wait, options = {}) {
//   let leading = true;
//   let trailing = true;

//   if (typeof func !== 'function') {
//     throw new TypeError('Expected a function');
//   }
//   if (typeof options === 'object') {
//     leading = 'leading' in options ? !!options.leading : leading;
//     trailing = 'trailing' in options ? !!options.trailing : trailing;
//   }
//   return debounce(func, wait, {
//     leading,
//     trailing,
//     maxWait: wait,
//   });
// }

// /**
//  * Creates a function that invokes `func` with `this` binding and arguments
//  * arranged according to the specified `indexes` where the argument value at the
//  * first `index` is provided as the first argument, the argument value at the
//  * second `index` is provided as the second argument, and so on.
//  * @param {Function} func The function to rearrange arguments for
//  * @param {...(number|number[])} indexes The arranged argument indexes
//  * @returns {Function} Returns the new function
//  */
// export function rearg(func, ...indexes) {
//   return function(...args) {
//     const length = indexes.length ? Math.min(indexes.length, args.length) : 0;
//     const newArgs = new Array(length);
//     let index = -1;

//     while (++index < length) {
//       newArgs[index] = args[indexes[index]];
//     }
//     return func.apply(this, newArgs);
//   };
// }
