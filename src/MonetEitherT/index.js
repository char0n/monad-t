'use strict';

const { isUndefined, isNotNull } = require('ramda-adjunct');
const { Either, Identity } = require('monet');
const { of, map, chain, ap } = require('fantasy-land');

const { aliasesForType } = require('../utils');


/* eslint-disable global-require */
let isFuture = null;
let FlutureTMonetEither = null;
try {
  ({ isFuture } = require('fluture'));
  FlutureTMonetEither = require('../FlutureTMonetEither');
} catch (e) { /* pass */ }
/* eslint-enable */


/**
 * @classdesc
 * MonetEitherT is a transformer for monet.Either monadic type.
 *
 * @description
 * Constructor for transforming monads. Call also be used as static function
 * without calling new statement.
 *
 * @class
 * @param {!Monad} monad
 * @param {boolean} isRightValue
 * @returns {MonetEitherT|Either|FlutureTMonetEither}
 * @constructor
 */
function MonetEitherT(monad, isRightValue = true) {
  if (isUndefined(new.target)) {
    if (isNotNull(FlutureTMonetEither) && isFuture(monad)) {
      return FlutureTMonetEither.fromFuture(monad);
    } else if (monad instanceof Identity.fn.init) {
      return Either.of(monad.get());
    } else if (monad instanceof Either.fn.init && isNotNull(FlutureTMonetEither)) {
      return FlutureTMonetEither.fromEither(monad);
    }
    return new MonetEitherT(monad);
  }

  this.run = monad;
  this.isRightValue = isRightValue;
}

/**
 * Wraps `monad` into left side of the transformer.
 *
 * @param {!Monad} monad
 * @returns {MonetEitherT}
 */
MonetEitherT.left = function left(monad) {
  return new this(monad, false);
};

/**
 * Wraps `monad` into right side of the transformer.
 *
 * @param {!Monad} monad
 * @returns {MonetEitherT|FlutureTMonetEither|Either}
 */
MonetEitherT.right = function right(monad) {
  return this(monad);
};

/**
 * Returns corresponding transformer for the monad.
 *
 * @method MonetEitherT.of
 * @param {!Monad} monad
 * @returns {MonetEitherT|FlutureTMonetEither|Either}
 */
MonetEitherT[of] = function unit(monad) {
  return this.right(monad);
};

/**
 * Returns true if this transformer is right, false otherwise.
 *
 * @returns {boolean}
 */
MonetEitherT.prototype.isRight = function isRight() {
  return this.isRightValue;
};

/**
 * Returns true if this transformer is left, false otherwise.
 *
 * @returns {boolean}
 */
MonetEitherT.prototype.isLeft = function isLeft() {
  return !this.isRight();
};

/**
 * Returns the value in the right side, otherwise throws an exception.
 *
 * @returns {Monad}
 */
MonetEitherT.prototype.right = function right() {
  if (this.isLeft()) {
    throw new Error('Illegal state. Cannot call right() on a MonetEitherT.left');
  }
  return this.run;
};

/**
 * Returns the value in the left side, otherwise throws an exception.
 *
 * @returns {Monad}
 */
MonetEitherT.prototype.left = function left() {
  if (this.isRight()) {
    throw new Error('Illegal state. Cannot call left() on a MonetEitherT.right');
  }
  return this.run;
};

/**
 * Functor interface. Map the right side of this transformer with the provided function.
 *
 * @method map
 * @memberOf MonetEitherT
 * @instance
 * @param {Function} fn
 * @returns {MonetEitherT}
 */
MonetEitherT.prototype[map] = function functor(fn) {
  if (!this.isRightValue) { return this }

  return this.constructor.of(
    this.run[map](fn)
  );
};

/**
 * Performs a monadic bind over the inner monad.
 *
 * @method chain
 * @memberOf MonetEitherT
 * @instance
 * @param {Function} fn
 * @returns {MonetEitherT}
 */
MonetEitherT.prototype[chain] = function flatMap(fn) {
  if (!this.isRightValue) { return this }

  return this.constructor.of(
    this.run[chain](v => fn(v).run)
  );
};

/**
 * This takes an MonetEitherT instance that has a function on the right side and then
 * applies it to the right side of itself.
 *
 * @method ap
 * @memberOf MonetEitherT
 * @instance
 * @param {MonetEitherT} monadWithFn
 * @returns {MonetEitherT}
 */
MonetEitherT.prototype[ap] = function apply(monadWithFn) {
  if (!this.isRightValue) { return this }

  return monadWithFn.chain(fn => this.map(fn));
};

aliasesForType(MonetEitherT);


module.exports = MonetEitherT;
