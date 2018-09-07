/** users routes with no-wildcard */
import test from 'ava';
import {parse, stringify} from '..';

const routes = [
  {id: 'userView', method: 'GET', url: '/users/:id'},
  {id: 'userDelete', method: 'DELETE', url: '/users/:id'},
  {id: 'users', url: '/users'},
];

test('should find no matching route for a non-existent URL', t => {
  const route = parse(routes, {url: '/'});
  t.deepEqual(route, undefined);
});

test('should find the userView route when specifying no method', t => {
  const {id, params} = parse(routes, {url: '/users/100'});
  t.deepEqual(id, 'userView');
  t.deepEqual(params, {id: '100'});
});

test('should find the userDelete route when specifying method: "DELETE"', t => {
  const {id} = parse(routes, {url: '/users/100', method: 'DELETE'});
  t.deepEqual(id, 'userDelete');
});
