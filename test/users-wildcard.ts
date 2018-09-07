/** users routes with non-lazy catch-all */
import test from 'ava';
import {parse, stringify} from '..';

const routes = [
  {id: 'userView', url: '/users/:id'},
  {id: 'userLongform', url: '/users/**'},
];

test('should find the userView route when specifying a simple id', t => {
  const {id} = parse(routes, {url: '/users/100'});
  t.deepEqual(id, 'userView');
});

test('should find the userLongform route for other urls', t => {
  const {id} = parse(routes, {url: '/users/1/create'});
  t.deepEqual(id, 'userLongform');
});

test('should find the userLongform route for other urls (2)', t => {
  const {id} = parse(routes, {url: '/users/1/sessions/2'});
  t.deepEqual(id, 'userLongform');
});
