'use strict';

const { once } = require('ramda');
const { isNotNull } = require('ramda-adjunct');

const FlutureTMonetEither = require('../FlutureTMonetEither');


const MonetEitherT = ({ monet, fluture = null }) => {
  const { Either, Identity } = monet;
  const FlutureTMonetEitherType = once(FlutureTMonetEither);

  const type = (monadOrValue) => {
    if (isNotNull(fluture) && fluture.isFuture(monadOrValue)) {
      return FlutureTMonetEitherType({ monet, fluture }).fromFuture(monadOrValue);
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
