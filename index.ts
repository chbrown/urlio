export interface Route {
  /** The pattern to match against requested urls. */
  url: string;
  /**
  If a 'method' field is provided when calling urlio.parse(...), only routes
  with matching 'method' values are considered. The value should generally be
  uppercase, since Node.js's http.IncomingMessage#method field is uppercase.

  The special value '*' will match any method.
  */
  method?: string;
}

export interface CompiledRoute {
  paramNames: string[];
  regExp: RegExp;
}

export interface Params {
  [index: string]: string;
  splat?: string;
}

/**
compilePattern takes a pattern like "/users/:id/:action" and returns an object
with two fields, e.g.,
    {
      paramNames: ['id', 'action'],
      regExp: /\/users\/([^/?#]+)\/([^/?#]+)/,
    }
*/
function compilePattern(url: string): CompiledRoute {
  const paramNames: string[] = [];
  const pattern = url
    // escape forward slashes (/)
    .replace(/\//g, '\\/')
    // replace {varName:pattern} with a group that uses the specified pattern
    // `pattern` should not contain any curly braces or capturing groups
    .replace(/\{(\w+):(.+?)\}/g, (match, group1, group2) => {
      paramNames.push(group1);
      return `(${group2})`;
    })
    // replace :varName segments with a group that matches everything but /, ?, and #
    .replace(/:(\w+)/g, (match, group1) => {
      paramNames.push(group1);
      return '([^/?#]+)';
    })
    // replace * with a non-greedy group that will match anything (or nothing)
    // replace ** with a greedy group that will match everything (or nothing)
    // these have to go in the same replace() call because a subsequent
    // replace() would replace part of the replacement
    .replace(/\*\*?/g, match => {
      paramNames.push('splat');
      return (match === '**') ? '(.*)' : '(.*?)';
    });
  const regExp = new RegExp(`^${pattern}$`);
  return {paramNames, regExp};
}

/**
Use the internal compilePattern function to compile all routes, which extends
each route with paramNames and regExp properties.
*/
export function compileRoutes<T extends Route>(routes: T[]): (T & CompiledRoute)[] {
  return routes.map(route => Object.assign(compilePattern(route.url), route));
}

/**
Called by parse() after compiling routes, but can be called directly after
running compileRoutes() on your raw routes.
*/
export function parsePrecompiled<T extends Route & CompiledRoute>(compiledRoutes: T[], {url, method}: {url: string, method?: string}): T & {params: Params} {
  const params: Params = {};
  // find the matching route
  const compareMethod = method !== undefined;
  const matchingRoute = compiledRoutes.find(route => {
    return route.regExp.test(url) && (!compareMethod || (route.method === method || route.method === '*'));
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
  return Object.assign({params}, matchingRoute);
}

/**
Given a path, find the matching Route and extract the values of its params for
that path. Returns undefined if no routes match.
*/
export function parse<T extends Route>(routes: T[], {url, method}: {url: string, method?: string}): T & {params: Params} {
  const compiledRoutes = compileRoutes(routes);
  return parsePrecompiled(compiledRoutes, {url, method});
}

/**
Given a route and params (like those that would be extracted from it), return
the matching url.
*/
export function stringify(route: Route, params: Params = {}) {
  return route.url
    // replace :varName segments with the named value in params
    .replace(/:(\w+)/g, (match, group1) => params[group1])
    // replace * or ** with the value of the param named 'splat' (where undefined evaluates to '')
    // TODO: handle multiple splats?
    .replace(/\*\*?/g, match => (params.splat === undefined) ? '' : params.splat);
}
