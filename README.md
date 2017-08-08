# monadT

Transformers for monadic algebraic structures

# Example

```javascript
const { MonetEitherT, FlutureTMonetEither } = require('monadT');
const monet = require('monet');
const fluture = require('fluture');

const { Either, Identity } = monet;
const { Future } = fluture;

const EitherT = MonetEitherT({ monet, fluture });
const FutureTEither = FlutureTMonetEither({ monet, fluture });


EitherT(Identity.of(1)); //=> Either.Right(1)
EitherT(Either.Right(1)); //=> Either.Right(1)
EitherT(Future.of(1)); //=> FutureTEither(1)
EitherT(1); //=> Either.Right(1)
EitherT.of(1); //=> Either.Right(1)

FutureTEither.of(1); //=> FutureTEither(1)
FutureTEither(Identity.of(1)); //=> FutureTEither(1)
FutureTEither(Future.of(1)); //=> FutureTEither(1)
FutureTEither(1); //=> FutureTEither(1)
FutureTEither(Either.Right(1)); //=> FutureTEither(1)
```
