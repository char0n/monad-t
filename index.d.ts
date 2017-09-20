declare module "monad-t" {
  import Fluture from 'fluture'
  import { Either } from 'monet'

  interface Cancellable {
    (): void
  }

  interface FlutureTMonetEither {
    and(future: Fluture): FlutureTMonetEither
    chain(fn: (arg: any) => FlutureTMonetEither): FlutureTMonetEither
    chainEither(fn: (arg: any) => Either<any, any>): FlutureTMonetEither
    chainFuture(fn: (arg: any) => Fluture): FlutureTMonetEither
    filter(predicate: (arg: any) => boolean, fnOrValue: any): FlutureTMonetEither
    fork(leftFn: (err: any) => void, rightFn: (val: any) => void): Cancellable
    map(fn: (arg: any) => any): FlutureTMonetEither
    leftMap(fn: (arg: any) => any): FlutureTMonetEither
    mapRej(fn: (arg: any) => any): FlutureTMonetEither
    promise(): Promise<any>
    tap(fn: (val: any) => any): FlutureTMonetEither
    tap(fn: (val: any) => FlutureTMonetEither): FlutureTMonetEither
  }

  export interface FlutureTMonetEitherStatic {
    encaseP(fn: (val: any) => Promise<any>, arg: any): FlutureTMonetEither
    encaseP(fn: (val: any) => Promise<any>): (arg: any) => FlutureTMonetEither
    encaseP2(fn: (val1: any, val2: any) => Promise<any>, arg1: any, arg2: any): FlutureTMonetEither
    encaseP2(fn: (val1: any, val2: any) => Promise<any>, arg1: any): (arg2: any) => FlutureTMonetEither
    encaseP2(fn: (val1: any, val2: any) => Promise<any>): (arg1: any) => (arg2: any) => FlutureTMonetEither
    encaseP3(fn: (val1: any, val2: any, val3: any) => Promise<any>, arg1: any, arg2: any, arg3: any): FlutureTMonetEither
    encaseP3(fn: (val1: any, val2: any, val3: any) => Promise<any>, arg1: any, arg2: any): (arg3: any) => FlutureTMonetEither
    encaseP3(fn: (val1: any, val2: any, val3: any) => Promise<any>, arg1: any): (arg2: any) => (arg3: any) => FlutureTMonetEither
    encaseP3(fn: (val1: any, val2: any, val3: any) => Promise<any>): (arg1: any) => (arg2: any) => (arg3: any) => FlutureTMonetEither
    both(futureEitherA: FlutureTMonetEither, futureEitherB: FlutureTMonetEither): FlutureTMonetEither
    cache(futureEither: FlutureTMonetEither): FlutureTMonetEither
    do(fn: GeneratorFunction): FlutureTMonetEither
    fromEither(either: Either): FlutureTMonetEither
    fromFuture(future: Fluture): FlutureTMonetEither
    fromValue(val: any): FlutureTMonetEither
    go(fn: GeneratorFunction): FlutureTMonetEither
    of(val: any): FlutureTMonetEither
    parallel(concurency: number, futureEitherList: FlutureTMonetEither[]): FlutureTMonetEither
    tryP(fn: () => Promise<any>): FlutureTMonetEither
  }

  export const FlutureTMonetEither: FlutureTMonetEitherStatic;

  interface MonetEitherT {
    ap(monad: MonetEitherT): MonetEitherT
    map(fn: (arg: any) => any): MonetEitherT
    chain(fn: (arg: any) => MonetEitherT): MonetEitherT
    isLeft(): boolean
    isRight(): boolean
    left(): any
    right(): any
  }

  interface MonetEitherTStatic {
    new(monad: any, isRightValue?: boolean): MonetEitherT
    (monad: any, isRightValue?: boolean): MonetEitherT | Either | FlutureTMonetEither
    left(monad: any): MonetEitherT | Either | FlutureTMonetEither
    of(monad: any): MonetEitherT | Either | FlutureTMonetEither
    right(monad: any): MonetEitherT | Either | FlutureTMonetEither
  }

  export const MonetEitherT: MonetEitherTStatic
}

declare module "monad-t/FlutureTMonetEither" {
  export { FlutureTMonetEither } from "monad-t"
}

declare module "monad-t/MonetEitherT" {
  export { MonetEitherT } from "monad-t"
}
