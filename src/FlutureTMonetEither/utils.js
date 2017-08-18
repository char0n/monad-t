'use strict';

const { pathEq } = require('ramda');
const { Either } = require('monet');
const { Future } = require('fluture');

const FlutureTMonetEither = require('./index');


// liftEither :: Either a -> FlutureTMonetEither a
const liftEither = m => FlutureTMonetEither.of(Future.of(m));

// liftFuture :: Future a -> FlutureTMonetEither a
const liftFuture = m => FlutureTMonetEither.of(m.map(Either.Right));

// isFlutureTMonetEither :: a -> Boolean
const isFlutureTMonetEither = pathEq(['@@type'], FlutureTMonetEither['@@type']);


module.exports = {
  liftEither,
  liftFuture,
  isFlutureTMonetEither,
};
