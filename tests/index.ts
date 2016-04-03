declare var require: (id: string) => any;

const {strictEqual, deepEqual} = require('assert');
const {describe, it} = require('mocha');

const {parse, stringify} = require('..');

describe('basic products routes', () => {

  const productsImportRoute = {id: 'productsImport', url: '/products/import'};
  const productsSEORoute =    {id: 'productsSEO',    url: '/products/{description:.+}-{productId:[0-9]+}'};
  const productsTableRoute =  {id: 'productsTable',  url: '/products'};
  const purchaseEditorRoute = {id: 'purchaseEditor', url: '/purchase/:purchaseId'};
  const homeRoute =           {id: 'home',           url: '/*'};
  const routes = [
    productsImportRoute,
    productsSEORoute,
    productsTableRoute,
    purchaseEditorRoute,
    homeRoute,
  ];

  it('should find the "productsTable" route', () => {
    const {id, params} = parse(routes, {url: '/products'});
    strictEqual(id, 'productsTable');
    deepEqual(params, {});
  });

  it('should find the "productsSEO" route', () => {
    const {id, params} = parse(routes, {url: '/products/ChinaVase-456'});
    strictEqual(id, 'productsSEO');
    deepEqual(params, {description: 'ChinaVase', productId: '456'});
  });

  it('should find the "purchaseEditor" route', () => {
    const {id, params} = parse(routes, {url: '/purchase/123'});
    strictEqual(id, 'purchaseEditor');
    deepEqual(params, {purchaseId: '123'});
  });

  it('should serialize the "purchaseEditor" route', () => {
    // params' values can be anything implicitly convertible to a string
    // TODO: test both strings and numbers?
    const url = stringify(purchaseEditorRoute, {purchaseId: 456});
    strictEqual(url, '/purchase/456');
  });

  it('should serialize the "productsImport" route with no params', () => {
    const url = stringify(productsImportRoute);
    strictEqual(url, '/products/import');
  });

  it('should serialize the "home" route with no splat value', () => {
    const url = stringify(homeRoute, {});
    strictEqual(url, '/');
  });

  it('should serialize the "home" route with the splat value "dashboard"', () => {
    const url = stringify(homeRoute, {splat: 'dashboard'});
    strictEqual(url, '/dashboard');
  });

});

describe('users routes with no-wildcard', () => {

  const routes = [
    {id: 'userView', method: 'GET', url: '/users/:id'},
    {id: 'userDelete', method: 'DELETE', url: '/users/:id'},
    {id: 'users', url: '/users'},
  ];

  it('should find no matching route for a non-existent URL', () => {
    const route = parse(routes, {url: '/'});
    strictEqual(route, undefined);
  });

  it('should find the userView route when specifying no method', () => {
    const {id, params} = parse(routes, {url: '/users/100'});
    strictEqual(id, 'userView');
    deepEqual(params, {id: '100'});
  });

  it('should find the userDelete route when specifying method: "DELETE"', () => {
    const {id} = parse(routes, {url: '/users/100', method: 'DELETE'});
    strictEqual(id, 'userDelete');
  });

});

describe('users routes with non-lazy catch-all', () => {

  const routes = [
    {id: 'userView', url: '/users/:id'},
    {id: 'userLongform', url: '/users/**'},
  ];

  it('should find the userView route when specifying a simple id', () => {
    const {id} = parse(routes, {url: '/users/100'});
    strictEqual(id, 'userView');
  });

  it('should find the userLongform route for other urls', () => {
    const {id} = parse(routes, {url: '/users/1/create'});
    strictEqual(id, 'userLongform');
  });

  it('should find the userLongform route for other urls (2)', () => {
    const {id} = parse(routes, {url: '/users/1/sessions/2'});
    strictEqual(id, 'userLongform');
  });

});
