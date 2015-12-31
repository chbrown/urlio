export interface Route {
  id: string;
  pattern: string;
}

export interface Params {
  [index: string]: string;
}

/**
compilePattern takes a pattern like "/users/:id/:action" and returns an object
with two fields, e.g.,
    {
      paramNames: ['id', 'action'],
      regExp: /\/users\/([^/?#]+)\/([^/?#]+)/,
    }
*/
export function compilePattern(pattern: string) {
  let paramNames: string[] = [];
  let source = pattern
    // escape forward slashes (/)
    .replace(/\//g, '\\/')
    // replace :varName segments with a group that matches everything but /, ?, and #
    .replace(/:(\w+)/g, (match, group1) => {
      paramNames.push(group1);
      return '([^/?#]+)';
    })
    // replace * with a non-greedy group that will match anything (or nothing)
    .replace(/\*/g, (match) => {
      paramNames.push('splat');
      return '(.*?)';
    });
  return {paramNames, regExp: new RegExp(source)};
}

function compileRoute({id, pattern}: Route) {
  let {paramNames, regExp} = compilePattern(pattern);
  return {id, pattern, paramNames, regExp};
}

/**
Given a path, find the matching Route and extract the values of its params for that path.
*/
export function parse(routes: Route[], path: string) {
  let params: Params = {};
  // compile the routes
  const compiledRoutes = routes.map(compileRoute);
  // find the matching route
  const matchingRoute = compiledRoutes.find(route => route.regExp.test(path));
  if (matchingRoute === undefined) {
    // console.error('Cound not match route for url:', url);
    return {id: null, params};
  }
  // the regExp.test worked, so match should too
  // TODO: avoid executing the matching regex twice (is test any cheaper than match?)
  const match = path.match(matchingRoute.regExp);
  matchingRoute.paramNames.map((paramName, i) => {
    params[paramName] = match[i + 1];
  });
  return {id: matchingRoute.id, params};
}

/**
Given an id and params, return the matching url.

If there is no route for the given `id`, returns ''.
*/
export function stringify(routes: Route[], id: string, params: Params = {}) {
  let compiledRoutes = routes.map(compileRoute);
  let matchingRoute = compiledRoutes.find(route => route.id === id);
  if (matchingRoute === undefined) {
    // console.error('Could not find route for state:', state);
    return '';
  }
  return matchingRoute.pattern
    // replace :varName segments with the named value in params
    .replace(/:(\w+)/g, (match, group1) => params[group1])
    // replace * with the value of the param named 'splat' (where undefined evaluates to '')
    // TODO: handle multiple splats?
    .replace(/\*/g, (match) => (params['splat'] === undefined) ? '' : params['splat']);
}
