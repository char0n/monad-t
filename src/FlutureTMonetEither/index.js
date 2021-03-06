'use strict';

const { prop, chain: chainR, pair, curry, always } = require('ramda');
const { isUndefined, isFunction, isGeneratorFunction } = require('ramda-adjunct');
const { of, map, chain } = require('fantasy-land');
const { Either, Identity } = require('monet');
const { Future, isFuture } = require('fluture');

const { aliasesForType } = require('../utils');

/**
 * @classdesc
 * FlutureTMonetEither is a transformer that wraps `monet.Either` into
 * `fluture.Future`.
 *
 * @description
 * Constructor for transforming monads. Call also be used as static function
 * without calling new statement.
 *
 * @class
 * @param {Identity|Either|Future} monad
 * @returns {FlutureTMonetEither}
 * @throws {Error}
 * @constructor
 *
 * @example
 *
 * EitherT(Identity.of(1)); //=> Either.Right(1)
 * EitherT(Either.Right(1)); //=> FlutureTMonetEither(1)
 * EitherT(Future.of(1)); //=> FlutureTMonetEither(1)
 * EitherT.of(Maybe.Some(1)); //=> EitherT<Maybe.Some(1)
 */
function FlutureTMonetEither(monad) {
  if (isUndefined(new.target)) {
    if (isFuture(monad)) {
      return FlutureTMonetEither.fromFuture(monad);
    } else if (monad instanceof Identity.fn.init) {
      return FlutureTMonetEither.fromValue(monad.get());
    } else if (monad instanceof Either.fn.init) {
      return FlutureTMonetEither.fromEither(monad);
    }
    throw new Error('FlutureTMonetEither can transform only specific monad types');
  }

  this.run = monad;
  this['@@type'] = this.constructor['@@type'];
}

/**
 * @type {string}
 * @example
 *
 * const { isFlutureTMonetEither } = require('monad-t/lib/FlutureTMonetEither/utils');
 * const FlutureTMonetEither = require('monad-t/lib/FlutureTMonetEither');
 *
 * isFlutureTMonetEither(FlutureTMonetEither.fromValue(1)); //=> true
 */
FlutureTMonetEither['@@type'] = 'FlutureTMonetEither';

/**
 * Creates a FlutureTMonetEither transformer from Either locked inside a Future.
 *
 * @method FlutureTMonetEither.of
 * @param {!Future} run Either wrapped in Future
 * @returns {FlutureTMonetEither}
 *
 * @example
 *
 * FlutureTMonetEither.of(Future.of(Either.Right(1))); //=> FlutureTMonetEither(1)
 */
FlutureTMonetEither[of] = function applicative(run) {
  return new this(run);
};

/**
 * Creates FlutureTMonetEither instance from a value, running a value through
 * the following composition: FlutureTMonetEither.of * Fluture.of * Either.Right
 *
 * @param {*} val
 * @returns {FlutureTMonetEither}
 *
 * @example
 *
 * FlutureTMonetEither.fromValue(1); //=> FlutureTMonetEither(1)
 */
FlutureTMonetEither.fromValue = function fromValue(val) {
  return this[of](Future.of(Either.Right(val)));
};

/**
 * Creates FlutureTMonetEither instance from an either, running it thought
 * the following composition: FlutureTMonetEither.of * Fluture.of
 *
 * @param {Either} either
 * @returns {FlutureTMonetEither}
 *
 * @example
 *
 * FlutureTMonetEither.fromEither(Either.Right(1)); //=> FlutureTMonetEither(1)
 */
FlutureTMonetEither.fromEither = function fromEither(either) {
  return this[of](Future.of(either));
};

/**
 * Creates FlutureTMonetEither instance from a future, transforming the value
 * locked inside the future into Either.Right, and then wrapping the future
 * into FlutureTMonetEither.
 *
 * @param {Future} future
 * @returns {FlutureTMonetEither}
 *
 * @example
 *
 * FlutureTMonetEither.fromFuture(Future.of(1)); //=> FlutureTMonetEither(1)
 */
FlutureTMonetEither.fromFuture = function fromFuture(future) {
  return this[of](future.map(Either.Right));
};

/**
 * Returns a Future which caches the resolution value of the given Future so that
 * whenever it's forked, it can load the value from cache rather than re-executing the chain.
 *
 * @param {FlutureTMonetEither} futureEither
 * @returns {FlutureTMonetEither}
 *
 * @example
 *
 * const loadDbRecordById = (id) => {
 *   console.log('Retrieving record from db');
 *   return DB.record.findById(id);
 * }
 *
 * const loadFromDb = FlutureTMonetEither.cache(
 *   FlutureTMonetEither.encaseP(loadSomethingFromDbById, 1)
 * );
 *
 * loadFromDb.fork(console.error, console.log);
 * //> "Retrieving record from db"
 * //> {...record...}
 *
 * loadFromDb.fork(console.error, console.log);
 * //> {...record...}
 */
FlutureTMonetEither.cache = function cache(futureEither) {
  return this.of(Future.cache(futureEither.run));
};

/**
 * Creates a Future which when forked runs all Futures in the given array in parallel,
 * ensuring no more than limit Futures are running at once.
 *
 * @param {number} runInParallelCount
 * @param {Array.<FlutureTMonetEither>} futureEitherList
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.parallel = function parallel(runInParallelCount, futureEitherList) {
  const futureList = futureEitherList
    .map(prop('run'))
    .map(chainR(
      (either) => {
        if (either.isRight()) {
          return Future.of(either.right());
        }
        return Future.reject(either.left());
      }
    ));
  return this.fromFuture(Future.parallel(runInParallelCount, futureList));
};

/**
 * Run two FlutureTMonetEithers in parallel. Basically like calling FlutureTMonetEither.parallel
 * with exactly two FlutureTMonetEithers.
 *
 * @param {FlutureTMonetEither} futureEitherA
 * @param {FlutureTMonetEither} futureEitherB
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.both = function both(futureEitherA, futureEitherB) {
  return this.parallel(2, pair(futureEitherA, futureEitherB));
};

/**
 * A specialized version of fantasy-do which works only for Futures, but has the advantage
 * of type-checking and not having to pass FlutureTMonetEither.of.
 * Another advantage is that the returned FlutureTMonetEither can be forked
 * multiple times, as opposed to with a general fantasy-do solution,
 * where forking the FlutureTMonetEither a second time behaves erroneously.
 *
 * Takes a function which returns an Iterator, commonly a generator-function,
 * and chains every produced FlutureTMonetEither over the previous.
 *
 * This allows for writing sequential asynchronous code without the pyramid of doom.
 * It's known as "coroutines" in Promise land, and "do-notation" in Haskell land.
 *
 * @param {Function} generator
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.do = function go(generator) {
  if (!isGeneratorFunction(generator)) {
    throw new Error('The only argument for Go constructor must be generator.');
  }

  return this.of(
    Future.do(function* gen() {
      const iterator = generator();

      let value;
      let state = iterator.next();

      while (!state.done) {
        value = yield state.value.run.chain((either) => {
          if (either.isLeft()) {
            return Future.reject(either.left());
          }

          return Future.of(either.right());
        });

        state = iterator.next(value);
      }

      return Either.of(state.value);
    })
  );
};

/**
 * Alias of `do`.
 *
 * @method
 * @static
 * @memberOf FlutureTMonetEither
 * @param {Function} generator
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.go = FlutureTMonetEither.do;

/**
 * Allows Promise-returning functions to be turned into FlutureTMonetEither-returning functions.
 *
 * Takes a function which returns a Promise, and a value, and returns a FlutureTMonetEither.
 * When forked, the FlutureTMonetEither calls the function with the value to produce the Promise,
 * and resolves with its resolution value, or rejects with its rejection reason.
 *
 * Partially applying encase with a function f allows us to create a "safe" version of f.
 * Instead of throwing exceptions, the encased version always returns a FlutureTMonetEither when
 * given the remaining argument(s).
 *
 * @param {Function} fn
 * @param {*} arg
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.encaseP = curry((fn, arg) => FlutureTMonetEither.of(
  Future.encaseP(fn, arg).map(Either.Right)
));

/**
 * Binary version of `encaseP`.
 *
 * @param {Function} fn
 * @param {*} arg1
 * @param {*} arg2
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.encaseP2 = curry((fn, arg1, arg2) => FlutureTMonetEither.of(
  Future.encaseP2(fn, arg1, arg2).map(Either.Right)
));

/**
 * Ternary version of `encaseP`.
 *
 * @param {Function} fn
 * @param {*} arg1
 * @param {*} arg2
 * @param {*} arg3
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.encaseP3 = curry((fn, arg1, arg2, arg3) => FlutureTMonetEither.of(
  Future.encaseP3(fn, arg1, arg2, arg3).map(Either.Right)
));

/**
 * Create a FlutureTMonetEither which when forked spawns a Promise using
 * the given function and resolves with its resolution value, or rejects with its rejection reason.
 *
 * @param {Function} fn
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.tryP = function tryP(fn) {
  return this.encaseP(fn, undefined);
};

/**
 * Transforms the resolution value inside the FlutureTMonetEither, and returns
 * a new FlutureTMonetEither with the transformed value.
 * This is like doing promise.then(x => x + 1), except that it's lazy,
 * so the transformation will not be applied before the FlutureTMonetEither is forked.
 * The transformation is only applied to the resolution branch:
 * If the FlutureTMonetEither is rejected, the transformation is ignored. *
 *
 * @method map
 * @memberOf FlutureTMonetEither
 * @instance
 * @param {Function} fn
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.prototype[map] = function functor(fn) {
  return this.constructor.of(
    this.run[map](
      either => either.map(fn)
    )
  );
};

/**
 * Allows the creation of a new FlutureTMonetEither based on the resolution value.
 * This is like doing promise.then(x => Promise.resolve(x + 1)), except that it's lazy,
 * so the new FlutureTMonetEither will not be created until the other one is forked.
 * The function is only ever applied to the resolution value;
 * it's ignored when the FlutureTMonetEither was rejected.
 * To learn more about the exact behaviour of chain.
 *
 * @method chain
 * @memberOf FlutureTMonetEither
 * @instance
 * @param {Function} fn
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.prototype[chain] = function bind(fn) {
  return this.constructor.of(
    this.run[chain](
      (either) => {
        if (either.isRight()) {
          return fn(either.right()).run;
        }
        return this.run.constructor.of(either);
      }
    )
  );
};

/**
 * Execute the computation that was passed to the FlutureTMonetEither
 * at construction using the given reject and resolve callbacks.
 *
 * @param {Function} leftFn
 * @param {Function} rightFn
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.prototype.fork = function fork(leftFn, rightFn) {
  return this.run.fork(
    leftFn,
    either => either.cata(leftFn, rightFn)
  );
};

/**
 * Returns a new FlutureTMonetEither which either rejects with the first rejection reason,
 * or resolves with the last resolution value once and if both FlutureTMonetEither resolve.
 * This behaves analogously to how JavaScript's and-operator does.
 *
 * @param {FlutureTMonetEither} futureEither
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.prototype.and = function and(futureEither) {
  return this.constructor.of(
    Future
      .of(either1 => either2 => either1.chain(always(either2)))
      .ap(this.run)
      .ap(futureEither.run)
  );
};

/**
 * Method for isolating asynchronous side effects.
 *
 * @param {Function} fn The function returning new instance of FlutureTMonetEither.
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.prototype.tapF = function tapF(fn) {
  return this[chain](val => fn(val).and(this.constructor.fromValue(val)));
};

/**
 * Method for isolating side effects.
 *
 * @param {Function} fn
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.prototype.tap = function tap(fn) {
  return this[map]((val) => {
    fn(val);
    return val;
  });
};

/**
 * Method for chaining inner Either with an either returned by
 * the supplied `fn`.
 *
 * @param {Function} fn The function generating new Either
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.prototype.chainEither = function chainEither(fn) {
  return this[chain](val => this.constructor.of(Future.of(fn(val))));
};

/**
 * Method for chaining inner Future with an Future returned by
 * the supplied `fn`. Future instance should not have value inside it, not Either.
 *
 * @param {Function} fn The function generating new Future
 * @returns {FlutureTMonetEither}
 */

FlutureTMonetEither.prototype.chainFuture = function chainFuture(fn) {
  return this.chain(v => this.constructor.fromFuture(fn(v)));
};

/**
 * Very similar to the filtering of a list, filter on FlutureTMonetEither
 * will filter out any elements that do not meet the predicate.
 *
 * @param {Function} predicate
 * @param {Function|*} fnOrValue
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.prototype.filter = function filter(predicate, fnOrValue) {
  return this[chain]((val) => {
    if (!predicate(val)) {
      if (isFunction(fnOrValue)) {
        return this.constructor.fromEither(Either.Left(fnOrValue(val)));
      }
      return this.constructor.fromEither(Either.Left(fnOrValue));
    }
    return this.constructor.fromValue(val);
  });
};

/**
 * Map over the rejection reason of the FlutureTMonetEither.
 * This is like map, but for the rejection branch.
 *
 * @param {Function} fn
 * @returns {FlutureTMonetEither}
 */
FlutureTMonetEither.prototype.mapRej = function mapRej(fn) {
  return this.constructor.of(this.run.mapRej(fn));
};

/**
 * Map over left side of the Either.
 *
 * @param {Function} fn
 * @return {FlutureTMonetEither}
 *
 * @example
 *
 * FlutureTMonetEither
 *   .fromEither(Either.Left(1))
 *   .leftMap(value => value + 1); //=> FlutureTMonetEither.<Future.<Either.Left(2)>>
 */
FlutureTMonetEither.prototype.leftMap = function leftMap(fn) {
  return this.constructor.of(
    this.run[map](
      either => either.leftMap(fn)
    )
  );
};

/**
 * An alternative way to fork the FlutureTMonetEither.
 * This eagerly forks the FlutureTMonetEither and
 * returns a Promise of the result. This is useful if some API wants you
 * to give it a Promise. It's the only method which forks the Future without
 * a forced way to handle the rejection branch, so I recommend against
 * using it for anything else.
 *
 * @returns {Promise}
 */
FlutureTMonetEither.prototype.promise = function promise() {
  return new Promise((resolve, reject) => this.fork(reject, resolve));
};


aliasesForType(FlutureTMonetEither);


module.exports = FlutureTMonetEither;
