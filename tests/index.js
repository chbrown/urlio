import {strictEqual, deepEqual} from 'assert';
import {describe, it} from 'mocha';

import {parse, stringify} from '..';

describe('basic products routes', () => {

  const productsImportRoute = {id: 'productsImport', url: '/products/import'};
  const productsTableRoute =  {id: 'productsTable',  url: '/products'};
  const purchaseEditorRoute = {id: 'purchaseEditor', url: '/purchase/:purchaseId'};
  const homeRoute =           {id: 'home',           url: '/*'};
  const routes = [
    productsImportRoute,
    productsTableRoute,
    purchaseEditorRoute,
    homeRoute,
  ];

  it('should find the "productsTable" route', () => {
    let {id, params} = parse(routes, {url: '/products'});
    strictEqual(id, 'productsTable');
    deepEqual(params, {});
  });

  it('should find the "purchaseEditor" route', () => {
    let {id, params} = parse(routes, {url: '/purchase/123'});
    strictEqual(id, 'purchaseEditor');
    deepEqual(params, {purchaseId: '123'});
  });

  it('should serialize the "purchaseEditor" route', () => {
    // params' values can be anything implicitly convertible to a string
    // TODO: test both strings and numbers?
    let url = stringify(purchaseEditorRoute, {purchaseId: 456});
    strictEqual(url, '/purchase/456');
  });

  it('should serialize the "productsImport" route with no params', () => {
    let url = stringify(productsImportRoute);
    strictEqual(url, '/products/import');
  });

  it('should serialize the "home" route with no splat value', () => {
    let url = stringify(homeRoute, {});
    strictEqual(url, '/');
  });

  it('should serialize the "home" route with the splat value "dashboard"', () => {
    let url = stringify(homeRoute, {splat: 'dashboard'});
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
    let route = parse(routes, {url: '/'});
    strictEqual(route, undefined);
  });

  it('should find the userView route when specifying no method', () => {
    let {id} = parse(routes, {url: '/users/100'});
    strictEqual(id, 'userView');
  });

  it('should find the userDelete route when specifying method: "DELETE"', () => {
    let {id} = parse(routes, {url: '/users/100', method: 'DELETE'});
    strictEqual(id, 'userDelete');
  });

});
