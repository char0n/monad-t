require('fantasy-land');
const { Future } = require('fluture');
const { Identity, Either } = require('monet');

const { MonetEitherT: EitherT } = require('monad-t');
const { FlutureTMonetEither: FutureTEither } = require('monad-t');


EitherT(Identity.of(1)); // => Either.Right(1)

FutureTEither.of(Future.of(Either.Right(1))); // => FlutureTMonetEither(1)
