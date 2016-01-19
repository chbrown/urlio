/**
Half-hearted (two-hearted?) shim for Object.assign.
*/
function assign<T, U>(target: T, source: U): T & U {
  for (var key in source) {
    target[key] = source[key];
  }
  return <any>target;
}

export interface Route {
  /** The pattern to match against requested urls. */
  url: string;
  /** If provided on the route and in the parse method, only routes with matches are returned. */
  method?: string;
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
function compilePattern(url: string): {paramNames: string[], regExp: RegExp} {
  let paramNames: string[] = [];
  let pattern = url
    // escape forward slashes (/)
    .replace(/\//g, '\\/')
    // replace :varName segments with a group that matches everything but /, ?, and #
    .replace(/:(\w+)/g, (match, group1) => {
      paramNames.push(group1);
      return '([^/?#]+)';
    })
    // replace * with a non-greedy group that will match anything (or nothing)
    // replace ** with a greedy group that will match everything (or nothing)
    // these have to go in the same replace() call because a subsequent
    // replace() would replace part of the replacement
    .replace(/\*\*?/g, (match) => {
      paramNames.push('splat');
      return (match === '**') ? '(.*)' : '(.*?)';
    });
  return {paramNames, regExp: new RegExp('^' + pattern + '$')};
}

/**
Given a path, find the matching Route and extract the values of its params for that path.
Returns undefined if no routes match.
*/
export function parse<T extends Route>(routes: T[], {url, method}: {url: string, method?: string}): T & {params: Params} {
  let params: Params = {};
  // compile the routes
  const compiledRoutes = routes.map(route => {
    return assign(compilePattern(route.url), route);
  });
  // find the matching route
  const compareMethod = method !== undefined;
  const matchingRoute = compiledRoutes.find(route => {
    return route.regExp.test(url) && (!compareMethod || (route.method === method));
  });
  if (matchingRoute === undefined) {
    return undefined;
  }
  // the regExp.test worked, so match should too
  // TODO: avoid executing the matching regex twice (is test any cheaper than match?)
  const match = url.match(matchingRoute.regExp);
  matchingRoute.paramNames.map((paramName, i) => {
    params[paramName] = match[i + 1];
  });
  return assign({params}, matchingRoute);
}

/**
Given a route and params (like those that would be extracted from it),
return the matching url.
*/
export function stringify(route: Route, params: Params = {}) {
  return route.url
    // replace :varName segments with the named value in params
    .replace(/:(\w+)/g, (match, group1) => params[group1])
    // replace * or ** with the value of the param named 'splat' (where undefined evaluates to '')
    // TODO: handle multiple splats?
    .replace(/\*\*?/g, (match) => (params['splat'] === undefined) ? '' : params['splat']);
}
