'use strict';

const { isNotNull } = require('ramda-adjunct');

const FlutureTMonetEither = require('../FlutureTMonetEither');


const MonetEitherT = ({ monet, fluture = null }) => {
  const { Either, Identity } = monet;

  const type = (monadOrValue) => {
    if (isNotNull(fluture) && fluture.isFuture(monadOrValue)) {
      return FlutureTMonetEither({ monet, fluture }).fromFuture(monadOrValue);
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
