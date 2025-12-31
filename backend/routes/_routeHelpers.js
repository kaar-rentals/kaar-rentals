// safe wrapper to coerce many export shapes into an express handler function
function asHandler(handler) {
  if (typeof handler === 'function') return handler;
  if (!handler) throw new Error('Route handler is undefined/null');
  
  // Common transpiled default export
  if (handler && typeof handler.default === 'function') return handler.default;
  
  // Common named properties
  if (handler && typeof handler.handler === 'function') return handler.handler;
  if (handler && typeof handler.handle === 'function') return handler.handle;
  
  // If the handler is an object containing multiple handlers, throw a descriptive error
  throw new Error('Route handler is not a function. Provided object keys: ' + Object.keys(handler).join(', '));
}

module.exports = { asHandler };

