# monad-t

Transformers for monadic algebraic structures bridging types from various monadic libraries.
All transformers are fully [fantasy-land](https://github.com/fantasyland/fantasy-land) compatible.
Read [this article](https://www.linkedin.com/pulse/monad-transformers-javascript-vladim%C3%ADr-gorej)
to fully understand what monad transformers are and how to fully utilize their power of transformation.

## Example

```javascript
const { MonetEitherT: EitherT, FlutureTMonetEither: FutureTEither } = require('monad-t');
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

## Optional dependencies

Usually developers use one or two monadic libraries in their projects. For example
developer can use `monet` and `fluture` in a project and it is not convenient
to install all of the optional dependencies of this package (there may be quite a lot in the future).
We recommend to use requires from a specific modules of this library so that
you won't end up with  `Cannot find module` error when requiring.

```javascript
const EitherT = require('monad-t/lib/MonetEitherT');
const FutureTEither = require('monad-t/lib/FlutureTMonetEither');


EitherT(Identity.of(1)); //=> Either.Right(1)
EitherT(Either.Right(1)); //=> FlutureTMonetEither(1)
EitherT(Future.of(1)); //=> FlutureTMonetEither(1)
EitherT.of(Maybe.Some(1)); //=> EitherT<Maybe.Some(1)

FutureTEither.of(Future.of(Either.Right(1))); //=> FlutureTMonetEither(1)
FutureTEither(Identity.of(1)); //=> FlutureTMonetEither(1)
FutureTEither(Future.of(1)); //=> FlutureTMonetEither(1)
FutureTEither(Either.Right(1)); //=> FlutureTMonetEither(1)
```

## API Documentation

[0.0.1](https://char0n.github.io/monad-t/0.0.2), [0.0.2](https://char0n.github.io/monad-t/0.0.2),
[0.0.3](https://char0n.github.io/monad-t/0.0.3), [0.1.0](https://char0n.github.io/monad-t/0.1.0),
[0.2.0](https://char0n.github.io/monad-t/0.2.0), [0.2.1](https://char0n.github.io/monad-t/0.2.1), 
[0.2.2](https://char0n.github.io/monad-t/0.2.2), [0.2.3](https://char0n.github.io/monad-t/0.2.3),
[LATEST](https://char0n.github.io/monad-t/0.2.3)

## Typescript support

Although `monad-t` is written in ES2016, we support Typescript. When `monad-t` gets
imported into Typescript project, typings are automatically imported and used.

### Author

char0n (Vladimir Gorej)
 
vladimir.gorej@gmail.com
 
https://www.linkedin.com/in/vladimirgorej/

### Contributors

 - Michael Kuk
 - Michal Svely
 - Honza Beseda
