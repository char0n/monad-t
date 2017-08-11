# monadT

Transformers for monadic algebraic structures

# Example

```javascript
const { MonetEitherT: EitherT, FlutureTMonetEither: FutureTEither } = require('monadT');
const { Future } = require('fluture');
const { Identity, Either, Maybe } = require('monet');


EitherT(Identity.of(1)); //=> Either.Right(1)
EitherT(Either.Right(1)); //=> FlutureTMonetEither(1)
EitherT(Future.of(1)); //=> FlutureTMonetEither(1)
EitherT.of(Maybe.Some(1)); //=> EitherT<Maybe.Some(1)

FutureTEither.of(Future.of(Either.Right(1))); //=> FlutureTMonetEither(1)
FutureTEither(Identity.of(1)); //=> FlutureTMonetEither(1)
FutureTEither(Future.of(1)); //=> FlutureTMonetEither(1)
FutureTEither(Either.Right(1)); //=> FlutureTMonetEither(1)
```
