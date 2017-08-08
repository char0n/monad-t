'use strict';

const fl = require('fantasy-land');

const { aliases } = require('../utils');


const FlutureTMonetEither = ({ fluture, monet }) => {
  const { Future, isFuture } = fluture;
  const { Identity, Either } = monet;

  function FutureEither(run) {
    if (!new.target) {
      if (isFuture(run)) {
        return FutureEither.fromFuture(run);
      } else if (run instanceof Identity.fn.init) {
        return FutureEither.fromValue(run.get());
      } else if (run instanceof Either.fn.init) {
        return FutureEither.fromEither(run);
      }
      return FutureEither.fromValue(run);
    }

    this.run = run;
  }

  FutureEither[fl.of] = function(run) {
    return new this(run);
  };

  FutureEither.fromValue = function (val) {
    return this[fl.of](Future.of(Either.Right(val)));
  };

  FutureEither.fromEither = function (either) {
    return this[fl.of](Future.of(either));
  };

  FutureEither.fromFuture = function (future) {
    return this[fl.of](future.map(Either.Right));
  };


  aliases(FutureEither).forEach(([alias, fn]) => {
    FutureEither[alias] = fn;
  });
  aliases(FutureEither.prototype).forEach(([alias, fn]) => {
    FutureEither.prototype[alias] = fn;
  });


  return FutureEither;
};


module.exports = FlutureTMonetEither;
