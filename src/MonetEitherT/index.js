'use strict';

const { isUndefined, isNotNull } = require('ramda-adjunct');
const { Either } = require('monet');
const fl = require('fantasy-land');

let isFuture = null;
let FlutureTMonetEither = null;
try {
  ({ isFuture } = require('fluture'));
  FlutureTMonetEither = require('../FlutureTMonetEither');
} catch (e) { /* pass */ }


function MonetEitherT(monad, isRightValue = true) {
  if (isUndefined(new.target)) {
    if (isNotNull(FlutureTMonetEither) && isFuture(monad)) {
      return FlutureTMonetEither.fromFuture(monad);
    } else if (monad instanceof Identity.fn.init) {
      return Either.of(monad.get());
    }
    return MonetEitherT[fl.of](monad);
  }

  this.run = monad;
  this.isRightValue = isRightValue;
}

MonetEitherT.left = function(monad) {
  return new this(monad, false);
};

MonetEitherT.right = function(monad) {
  return MonetEitherT[fl.of](monad)
};

MonetEitherT.prototype.isRight = function() {
  return this.isRightValue;
};

MonetEitherT.prototype.isLeft = function() {
  return !this.isRight();
};

MonetEitherT.prototype.right = function() {
  if (this.isLeft()) {
    throw new Error('Illegal state. Cannot call right() on a MonetEitherT.left');
  }
  return this.run;
};

MonetEitherT.prototype.left = function() {
  if (this.isRight()) {
    throw new Error('Illegal state. Cannot call left() on a MonetEitherT.right')
  }
  return this.run;
};

MonetEitherT[fl.of] = function(monad) {
  return new this(monad);
};

MonetEitherT.prototype[fl.map] = function(fn) {
  if (!this.isRightValue) { return this }

  return this.constructor.of(
    this.run.map(v => v.map(fn))
  );
};

MonetEitherT.prototype[fl.chain] = function(fn) {
  if (!this.isRightValue) { return this }

  return this.constructor.of(
    this.run.map(v => v[fl.chain](fn))
  );
};

MonetEitherT.prototype[fl.ap] = function(monadWithFn) {
  if (!this.isRightValue) { return this }

  return this.constructor.of(
    this.run[fl.chain](v =>
      monadWithFn.run.map(v2 =>
        v[fl.ap](v2)
      )
    )
  );
};


module.exports = MonetEitherT;
