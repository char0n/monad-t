'use strict';

const FlutureTMonetEither = require('../FlutureTMonetEither');


const MonetEitherT = ({ monet, fluture }) => {
  const { isFuture } = fluture;
  const { Either, Identity } = monet;
  const FutureTEither = FlutureTMonetEither({ monet, fluture });

  const type = (monadOrValue) => {
    if (isFuture(monadOrValue)) {
      return FutureTEither.fromFuture(monadOrValue);
    } else if (monadOrValue instanceof Identity.fn.init) {
      return Either.of(monadOrValue.get());
    } else if (monadOrValue instanceof Either.fn.init) {
      return monadOrValue;
    }
    return Either.of(monadOrValue);
  };

  return Object.assign(type, Either);
};


module.exports = MonetEitherT;
