'use strict';

const { isUndefined } = require('ramda-adjunct');
const fl = require('fantasy-land');
const { Either, Identity } = require('monet');
const { Future, isFuture } = require('fluture');

const { aliasesForType } = require('../utils');


function FlutureTMonetEither(monad) {
  if (isUndefined(new.target)) {
    if (isFuture(monad)) {
      return FlutureTMonetEither.fromFuture(monad);
    } else if (monad instanceof Identity.fn.init) {
      return FlutureTMonetEither.fromValue(monad.get());
    } else if (monad instanceof Either.fn.init) {
      return FlutureTMonetEither.fromEither(monad);
    } else {
      throw new Error('FlutureTMonetEither can transform only specific monad types');
    }
  }

  this.run = monad;
}

FlutureTMonetEither[fl.of] = function(run) {
  return new this(run);
};

FlutureTMonetEither.fromValue = function (val) {
  return this[fl.of](Future.of(Either.Right(val)));
};

FlutureTMonetEither.fromMonad = function(monad) {
  return this[fl.of](Future.of(monad));
};

FlutureTMonetEither.fromEither = function (either) {
  return this[fl.of](Future.of(either));
};

FlutureTMonetEither.fromFuture = function (future) {
  return this[fl.of](future.map(Either.Right));
};

aliasesForType(FlutureTMonetEither);


module.exports = FlutureTMonetEither;
