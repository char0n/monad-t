const { Future } = require('fluture');
const { Identity, Either } = require('monet@0.9.0-alpha.2');

const { MonetEitherT: EitherT } = require('monadT/MonetEitherT');
const { FlutureTMonetEither: FutureTEither } = require('monadT/FlutureTMonetEither');


EitherT(Identity.of(1)); // => Either.Right(1)

FutureTEither.of(Future.of(Either.Right(1))); // => FlutureTMonetEither(1)
