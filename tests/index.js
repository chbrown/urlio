import assert from 'assert';
import {describe, it} from 'mocha';

import {parse, stringify} from '..';

describe('basic products routes', () => {

  const routes = [
    {
      id: 'productsImport',
      pattern: '/products/import',
    },
    {
      id: 'productsTable',
      pattern: '/products',
    },
    {
      id: 'purchaseEditor',
      pattern: '/purchase/:purchaseId',
    },
    {
      id: 'home',
      pattern: '/*',
    },
  ];

  it('should find the "productsTable" route', () => {
    let {id, params} = parse(routes, '/products');
    assert.equal(id, 'productsTable');
    assert.deepEqual(params, {});
  });

  it('should find the "purchaseEditor" route', () => {
    let {id, params} = parse(routes, '/purchase/123');
    assert.equal(id, 'purchaseEditor');
    assert.deepEqual(params, {purchaseId: '123'});
  });

  it('should serialize the "purchaseEditor" route', () => {
    // params' values can be anything implicitly convertible to a string
    // TODO: test both strings and numbers?
    let url = stringify(routes, 'purchaseEditor', {purchaseId: 456});
    assert.equal(url, '/purchase/456');
  });

  it('should serialize the "productsImport" route with no params', () => {
    let url = stringify(routes, 'productsImport');
    assert.equal(url, '/products/import');
  });

  it('should serialize the "home" route with no splat value', () => {
    let url = stringify(routes, 'home', {});
    assert.equal(url, '/');
  });

  it('should serialize the "home" route with the splat value "dashboard"', () => {
    let url = stringify(routes, 'home', {splat: 'dashboard'});
    assert.equal(url, '/dashboard');
  });

  it('should serialize a non-existent route as ""', () => {
    let url = stringify(routes, 'unknown route...', {});
    assert.equal(url, '');
  });

});

describe('users routes with no-wildcard', () => {

  const routes = [
    {
      id: 'user',
      pattern: '/users/:id',
    },
    {
      id: 'users',
      pattern: '/users',
    },
  ];

  it('should find no matching route for a non-existent URL', () => {
    let {id, params} = parse(routes, '/');
    assert.equal(id, null);
    assert.deepEqual(params, {});
  });

});
