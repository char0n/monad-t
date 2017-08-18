'use strict';

const { prop, chain, pair, curry } = require('ramda');
const { isUndefined, isFunction, isGeneratorFunction } = require('ramda-adjunct');
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
    }
    throw new Error('FlutureTMonetEither can transform only specific monad types');
  }

  this.run = monad;
  this['@@type'] = this.constructor['@@type'];
}

FlutureTMonetEither['@@type'] = 'FlutureTMonetEither';

FlutureTMonetEither[fl.of] = function of(run) {
  return new this(run);
};

FlutureTMonetEither.fromValue = function fromValue(val) {
  return this[fl.of](Future.of(Either.Right(val)));
};

FlutureTMonetEither.fromMonad = function fromMonad(monad) {
  return this[fl.of](Future.of(monad));
};

FlutureTMonetEither.fromEither = function fromEither(either) {
  return this[fl.of](Future.of(either));
};

FlutureTMonetEither.fromFuture = function fromFuture(future) {
  return this[fl.of](future.map(Either.Right));
};

FlutureTMonetEither.cache = function caech(futureEither) {
  return this.of(Future.cache(futureEither.run));
};

FlutureTMonetEither.parallel = function parallel(runInParallelCount, futureEitherList) {
  const futureList = futureEitherList
    .map(prop('run'))
    .map(chain(
      (either) => {
        if (either.isRight()) {
          return Future.of(either.right());
        }
        return Future.reject(either.left());
      }
    ));
  return this.fromFuture(Future.parallel(runInParallelCount, futureList));
};

FlutureTMonetEither.both = function both(futureEitherA, futureEitherB) {
  return this.parallel(2, pair(futureEitherA, futureEitherB));
};

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

FlutureTMonetEither.go = FlutureTMonetEither.do;

FlutureTMonetEither.encaseP = curry((fn, arg) => FlutureTMonetEither.of(
  Future.encaseP(fn, arg).map(Either.Right)
));

FlutureTMonetEither.encaseP2 = curry((fn, arg1, arg2) => FlutureTMonetEither.of(
  Future.encaseP2(fn, arg1, arg2).map(Either.Right)
));

FlutureTMonetEither.encaseP3 = curry((fn, arg1, arg2, arg3) => FlutureTMonetEither.of(
  Future.encaseP3(fn, arg1, arg2, arg3).map(Either.Right)
));

FlutureTMonetEither.tryP = function tryP(fn) {
  return this.encaseP(fn, undefined);
};

FlutureTMonetEither.prototype[fl.map] = function map(fn) {
  return this.constructor.of(
    this.run[fl.map](
      either => either.map(fn)
    )
  );
};

FlutureTMonetEither.prototype[fl.chain] = function bind(fn) {
  return this.constructor.of(
    this.run[fl.chain](
      (either) => {
        if (either.isRight()) {
          return fn(either.right()).run;
        }
        return this.run.constructor.of(either);
      }
    )
  );
};

FlutureTMonetEither.prototype.fork = function fork(leftFn, rightFn) {
  return this.run.fork(
    leftFn,
    either => either.cata(leftFn, rightFn)
  );
};

FlutureTMonetEither.prototype.and = function and(futureEither) {
  return this.constructor.of(
    this.run.and(futureEither.run)
  );
};

FlutureTMonetEither.prototype.tapF = function tapF(fn) {
  return this[fl.chain](val => fn(val).and(this.constructor.fromValue(val)));
};

FlutureTMonetEither.prototype.tap = function tap(fn) {
  return this[fl.map]((val) => {
    fn(val);
    return val;
  });
};

FlutureTMonetEither.prototype.chainEither = function chainEither(fn) {
  return this[fl.chain](val => this.constructor.of(Future.of(fn(val))));
};

FlutureTMonetEither.prototype.chainFuture = function chainFuture(fn) {
  return this.constructor.of(this.run.chain(fn));
};

FlutureTMonetEither.prototype.filter = function filter(predicate, fnOrValue) {
  return this[fl.chain]((val) => {
    if (!predicate(val)) {
      if (isFunction(fnOrValue)) {
        return this.constructor.fromEither(Either.Left(fnOrValue(val)));
      }
      return this.constructor.fromEither(Either.Left(fnOrValue));
    }
    return this.constructor.fromValue(val);
  });
};

FlutureTMonetEither.prototype.mapRej = function mapRej(fn) {
  return this.constructor.of(this.run.mapRej(fn));
};

FlutureTMonetEither.prototype.promise = function promise() {
  return new Promise((resolve, reject) => this.fork(reject, resolve));
};


aliasesForType(FlutureTMonetEither);


module.exports = FlutureTMonetEither;
