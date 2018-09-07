/** basic products routes */
import test from 'ava';
import {parse, stringify} from '..';

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

test('should find the "productsTable" route', t => {
  const {id, params} = parse(routes, {url: '/products'});
  t.deepEqual(id, 'productsTable');
  t.deepEqual(params, {});
});

test('should find the "productsSEO" route', t => {
  const {id, params} = parse(routes, {url: '/products/ChinaVase-456'});
  t.deepEqual(id, 'productsSEO');
  t.deepEqual(params, {description: 'ChinaVase', productId: '456'});
});

test('should find the "purchaseEditor" route', t => {
  const {id, params} = parse(routes, {url: '/purchase/123'});
  t.deepEqual(id, 'purchaseEditor');
  t.deepEqual(params, {purchaseId: '123'});
});

test('should serialize the "purchaseEditor" route', t => {
  // TODO: test both strings and numbers?
  const url = stringify(purchaseEditorRoute, {purchaseId: 456});
  t.deepEqual(url, '/purchase/456');
});

test('should serialize the "productsImport" route with no params', t => {
  const url = stringify(productsImportRoute);
  t.deepEqual(url, '/products/import');
});

test('should serialize the "home" route with no splat value', t => {
  const url = stringify(homeRoute, {});
  t.deepEqual(url, '/');
});

test('should serialize the "home" route with the splat value "dashboard"', t => {
  const url = stringify(homeRoute, {splat: 'dashboard'});
  t.deepEqual(url, '/dashboard');
});
