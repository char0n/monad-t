'use strict';

const { isUndefined, isNotNull } = require('ramda-adjunct');
const { Either, Identity } = require('monet');
const fl = require('fantasy-land');

const { aliasesForType } = require('../utils');

/* eslint-disable global-require */
let isFuture = null;
let FlutureTMonetEither = null;
try {
  ({ isFuture } = require('fluture'));
  FlutureTMonetEither = require('../FlutureTMonetEither');
} catch (e) { /* pass */ }
/* eslint-enable */


function MonetEitherT(monad, isRightValue = true) {
  if (isUndefined(new.target)) {
    if (isNotNull(FlutureTMonetEither) && isFuture(monad)) {
      return FlutureTMonetEither.fromFuture(monad);
    } else if (monad instanceof Identity.fn.init) {
      return Either.of(monad.get());
    } else if (monad instanceof Either.fn.init && isNotNull(FlutureTMonetEither)) {
      return FlutureTMonetEither.fromEither(monad);
    }
    return MonetEitherT[fl.of](monad);
  }

  this.run = monad;
  this.isRightValue = isRightValue;
}

MonetEitherT.left = function left(monad) {
  return new this(monad, false);
};

MonetEitherT.right = function right(monad) {
  return MonetEitherT[fl.of](monad);
};

MonetEitherT.fromEither = function fromEither(either) {
  return FlutureTMonetEither.fromEither(either);
};

MonetEitherT.prototype.isRight = function isRight() {
  return this.isRightValue;
};

MonetEitherT.prototype.isLeft = function isLeft() {
  return !this.isRight();
};

MonetEitherT.prototype.right = function right() {
  if (this.isLeft()) {
    throw new Error('Illegal state. Cannot call right() on a MonetEitherT.left');
  }
  return this.run;
};

MonetEitherT.prototype.left = function left() {
  if (this.isRight()) {
    throw new Error('Illegal state. Cannot call left() on a MonetEitherT.right');
  }
  return this.run;
};

MonetEitherT[fl.of] = function of(monad) {
  return new this(monad);
};

MonetEitherT.prototype[fl.map] = function map(fn) {
  if (!this.isRightValue) { return this }

  return this.constructor.of(
    this.run.map(v => v.map(fn))
  );
};

MonetEitherT.prototype[fl.chain] = function chain(fn) {
  if (!this.isRightValue) { return this }

  return this.constructor.of(
    this.run.map(v => v[fl.chain](fn))
  );
};

MonetEitherT.prototype[fl.ap] = function ap(monadWithFn) {
  if (!this.isRightValue) { return this }

  return this.constructor.of(
    this.run[fl.chain](v =>
      monadWithFn.run.map(v2 =>
        v[fl.ap](v2)
      )
    )
  );
};

aliasesForType(MonetEitherT);


module.exports = MonetEitherT;
