'use strict';

const Future = require('fluture');
const { Either } = require('monet');
const { noop } = require('ramda-adjunct');
const sinon = require('sinon');
const { sum } = require('ramda');
const chai = require('chai');

const FlutureTMonetEither = require('../../src/FlutureTMonetEither');
const { isFlutureTMonetEither, liftFuture, liftEither } = require('../../src/FlutureTMonetEither/util');


const { assert } = chai;


describe('FlutureTMonetEither', function() {
  it('tests applicative', function() {
    const fe = FlutureTMonetEither.of(Future.of(Either.Right(1)));

    assert.isTrue(isFlutureTMonetEither(fe));
  });

  it('tests functor (right on Either)', function(done) {
    const add = a => b => a + b;
    const fe = FlutureTMonetEither.of(Future.of(Either.Right(1))).map(add(1));

    fe.fork(
      noop,
      (val) => {
        assert.strictEqual(val, 2);
        done();
      }
    );
  });

  it('tests functor (left on Either)', function(done) {
    const add = a => b => a + b;
    const error = new Error();
    const fe = FlutureTMonetEither.of(Future.of(Either.Left(error))).map(add(1));

    fe.fork(
      (val) => {
        assert.strictEqual(val, error);
        done();
      },
      noop
    );
  });

  it('tests functor (left on Future)', function(done) {
    const add = a => b => a + b;
    const error = new Error();
    const fe = FlutureTMonetEither.of(Future.reject(error)).map(add(1));

    fe.fork(
      (val) => {
        assert.strictEqual(val, error);
        done();
      },
      noop
    );
  });

  it('tests chain (right on Either)', function(done) {
    const add1 = a => FlutureTMonetEither.of(Future.of(Either.Right(a + 1)));
    const fe = FlutureTMonetEither.of(Future.of(Either.Right(1))).chain(add1);

    fe.fork(
      noop,
      (val) => {
        assert.strictEqual(val, 2);
        done();
      }
    );
  });

  it('tests chain (left on Either)', function(done) {
    const error = new Error();
    const add1 = a => FlutureTMonetEither.of(Future.of(Either.Left(a + 1)));
    const fe = FlutureTMonetEither.of(Future.of(Either.Left(error))).chain(add1);

    fe.fork(
      (val) => {
        assert.strictEqual(val, error);
        done();
      },
      noop
    );
  });

  it('tests chain (left on Future)', function(done) {
    const error = new Error();
    const add1 = () => FlutureTMonetEither.of(Future.reject(error));
    const fe = FlutureTMonetEither.of(Future.of(Either.Left(error))).chain(add1);

    fe.fork(
      (val) => {
        assert.strictEqual(val, error);
        done();
      },
      noop
    );
  });

  it('tests fork (left)', function(done) {
    const error = new Error();
    const fe = FlutureTMonetEither.of(Future.reject(error));

    fe.fork(
      (val) => {
        assert.strictEqual(val, error);
        done();
      },
      noop
    );
  });

  it('tests fork (right)', function(done) {
    const fe = FlutureTMonetEither.of(Future.of(Either.Right(1)));

    fe.fork(
      noop,
      (val) => {
        assert.strictEqual(val, 1);
        done();
      }
    );
  });

  it('tests promise (resolve)', function() {
    const fe = FlutureTMonetEither.of(Future.of(Either.Right(1)));

    return fe.promise().then(val => assert.strictEqual(val, 1));
  });

  it('tests promise (reject)', function() {
    const error = new Error();
    const fe = FlutureTMonetEither.of(Future.reject(error));

    return fe.promise().catch(err => assert.strictEqual(err, error));
  });

  describe('tests encaseP', function() {
    it('tests calling Future.encaseP under the hood', function(done) {
      const expectedVal = 1;
      const fn = sinon.stub().returns(Promise.resolve(expectedVal));

      FlutureTMonetEither
        .encaseP(fn, 1)
        .fork(
          noop,
          (val) => {
            sinon.assert.calledOnce(fn);
            sinon.assert.calledWithExactly(fn, 1);
            assert.strictEqual(val, expectedVal);
            done();
          }
        );
    });

    it('tests currying with arity 1', function(done) {
      const fn = sinon.stub().returns(Promise.resolve(1));

      FlutureTMonetEither
        .encaseP(fn)(1)
        .fork(
          noop,
          (val) => {
            sinon.assert.calledOnce(fn);
            sinon.assert.calledWithExactly(fn, 1);
            assert.strictEqual(val, 1);
            done();
          }
        );
    });

    it('tests currying with arity 2', function(done) {
      const fn = sinon.stub().returns(Promise.resolve(1));

      FlutureTMonetEither
        .encaseP(fn, 1)
        .fork(
          noop,
          (val) => {
            sinon.assert.calledOnce(fn);
            sinon.assert.calledWithExactly(fn, 1);
            assert.strictEqual(val, 1);
            done();
          }
        );
    });
  });

  describe('tests encaseP2', function() {
    it('tests calling Future.encaseP under the hood', function(done) {
      const expectedVal = 1;
      const fn = sinon.stub().returns(Promise.resolve(expectedVal));

      FlutureTMonetEither
        .encaseP2(fn, 1, 2)
        .fork(
          noop,
          (val) => {
            sinon.assert.calledOnce(fn);
            sinon.assert.calledWithExactly(fn, 1, 2);
            assert.strictEqual(val, expectedVal);
            done();
          }
        );
    });

    it('tests currying with arity 1', function(done) {
      const fn = sinon.stub().returns(Promise.resolve(1));

      FlutureTMonetEither
        .encaseP2(fn)(1, 2)
        .fork(
          noop,
          (val) => {
            sinon.assert.calledOnce(fn);
            sinon.assert.calledWithExactly(fn, 1, 2);
            assert.strictEqual(val, 1);
            done();
          }
        );
    });

    it('tests currying with arity 3', function(done) {
      const fn = sinon.stub().returns(Promise.resolve(1));

      FlutureTMonetEither
        .encaseP2(fn, 1, 2)
        .fork(
          noop,
          (val) => {
            sinon.assert.calledOnce(fn);
            sinon.assert.calledWithExactly(fn, 1, 2);
            assert.strictEqual(val, 1);
            done();
          }
        );
    });
  });

  describe('tests encaseP3', function() {
    it('tests calling Future.encaseP under the hood', function(done) {
      const expectedVal = 1;
      const fn = sinon.stub().returns(Promise.resolve(expectedVal));

      FlutureTMonetEither
        .encaseP3(fn, 1, 2, 3)
        .fork(
          noop,
          (val) => {
            sinon.assert.calledOnce(fn);
            sinon.assert.calledWithExactly(fn, 1, 2, 3);
            assert.strictEqual(val, expectedVal);
            done();
          }
        );
    });

    it('tests currying with arity 1', function(done) {
      const fn = sinon.stub().returns(Promise.resolve(1));

      FlutureTMonetEither
        .encaseP3(fn)(1, 2, 3)
        .fork(
          noop,
          (val) => {
            sinon.assert.calledOnce(fn);
            sinon.assert.calledWithExactly(fn, 1, 2, 3);
            assert.strictEqual(val, 1);
            done();
          }
        );
    });

    it('tests currying with arity 4', function(done) {
      const fn = sinon.stub().returns(Promise.resolve(1));

      FlutureTMonetEither
        .encaseP3(fn, 1, 2, 3)
        .fork(
          noop,
          (val) => {
            sinon.assert.calledOnce(fn);
            sinon.assert.calledWithExactly(fn, 1, 2, 3);
            assert.strictEqual(val, 1);
            done();
          }
        );
    });
  });

  it('tests fromValue', function(done) {
    const fe = FlutureTMonetEither.fromValue(1);

    fe.fork(
      noop,
      (val) => {
        assert.strictEqual(val, 1);
        done();
      }
    );
  });

  it('tests fromEither', function(done) {
    const fe = FlutureTMonetEither.fromEither(Either.Right(1));

    fe.fork(
      noop,
      (val) => {
        assert.strictEqual(val, 1);
        done();
      }
    );
  });

  it('tests fromFuture', function(done) {
    const fe = FlutureTMonetEither.fromFuture(Future.of(1));

    fe.fork(
      noop,
      (val) => {
        assert.strictEqual(val, 1);
        done();
      }
    );
  });

  it('tests cache', function(done) {
    const fn = sinon.stub().returns(Promise.resolve(1));
    const fe = FlutureTMonetEither.encaseP(fn, 4);
    const cachedFe = FlutureTMonetEither.cache(fe);

    FlutureTMonetEither
      .fromValue(2)
      .chain(() => cachedFe)
      .chain(() => cachedFe)
      .fork(
        noop,
        (val) => {
          assert.strictEqual(val, 1);
          sinon.assert.calledOnce(fn);
          sinon.assert.calledWithExactly(fn, 4);
          done();
        }
      );
  });

  it('tests and', function(done) {
    FlutureTMonetEither
      .fromValue(1)
      .and(FlutureTMonetEither.fromValue(2))
      .fork(
        noop,
        (val) => {
          assert.strictEqual(val, 2);
          done();
        }
      );
  });

  it('tests tapF', function(done) {
    FlutureTMonetEither
      .fromValue(1)
      .tapF(() => FlutureTMonetEither.fromValue(2))
      .fork(
        noop,
        (val) => {
          assert.strictEqual(val, 1);
          done();
        }
      );
  });

  it('tests tap', function(done) {
    FlutureTMonetEither
      .fromValue(1)
      .fork(
        noop,
        (val) => {
          assert.strictEqual(val, 1);
          done();
        }
      );
  });

  it('tests chainEither', function(done) {
    FlutureTMonetEither
      .fromValue(1)
      .chainEither(() => Either.Right(2))
      .fork(
        noop,
        (val) => {
          assert.strictEqual(val, 2);
          done();
        }
      );
  });

  it('tests chainEither (left)', function(done) {
    const error = new Error();

    FlutureTMonetEither
      .fromEither(Either.Left(error))
      .chainEither(() => Either.Right(2))
      .fork(
        (val) => {
          assert.strictEqual(val, error);
          done();
        },
        noop
      );
  });

  it('tests chainFuture', function(done) {
    FlutureTMonetEither
      .fromValue(1)
      .chainFuture(() => Future.of(Either.Right(2)))
      .fork(
        noop,
        (val) => {
          assert.strictEqual(val, 2);
          done();
        }
      );
  });

  it('tests parallel (right)', function(done) {
    FlutureTMonetEither
      .parallel(2, [
        FlutureTMonetEither.fromValue(1),
        FlutureTMonetEither.fromValue(2),
        FlutureTMonetEither.fromValue(3),
      ])
      .map(sum)
      .fork(
        noop,
        (val) => {
          assert.strictEqual(val, 6);
          done();
        }
      );
  });

  it('tests parallel (left)', function(done) {
    FlutureTMonetEither
      .parallel(2, [
        FlutureTMonetEither.fromValue(1),
        FlutureTMonetEither.fromEither(Either.Left(2)),
        FlutureTMonetEither.fromValue(3),
      ])
      .fork(
        (val) => {
          assert.strictEqual(val, 2);
          done();
        },
        noop
      );
  });

  it('tests both (right)', function(done) {
    FlutureTMonetEither
      .both(
        FlutureTMonetEither.fromValue(1),
        FlutureTMonetEither.fromValue(2)
      )
      .map(sum)
      .fork(
        noop,
        (val) => {
          assert.strictEqual(val, 3);
          done();
        }
      );
  });

  it('tests both (left)', function(done) {
    FlutureTMonetEither
      .both(
        FlutureTMonetEither.fromEither(Either.Left(1)),
        FlutureTMonetEither.fromValue(2)
      )
      .map(sum)
      .fork(
        (val) => {
          assert.strictEqual(val, 1);
          done();
        },
        noop
      );
  });

  describe('tests do', function() {
    it('tests right side', function(done) {
      FlutureTMonetEither.do(function* generator() {
        const valA = yield FlutureTMonetEither.fromValue(1);
        const valB = yield FlutureTMonetEither.fromValue(2);

        return { valA, valB };
      })
        .fork(
          noop,
          (val) => {
            assert.deepEqual(val, { valA: 1, valB: 2 });
            done();
          }
        );
    });

    it('tests left side', function(done) {
      FlutureTMonetEither.do(function* generator() {
        const valA = yield FlutureTMonetEither.fromEither(Either.Left(1));
        const valB = yield FlutureTMonetEither.fromValue(2);

        return { valA, valB };
      })
        .fork(
          (val) => {
            assert.strictEqual(val, 1);
            done();
          },
          noop
        );
    });

    it('tests for alias go', function() {
      assert.strictEqual(FlutureTMonetEither.do, FlutureTMonetEither.go);
    });

    it('tests for input function to be a generator', function() {
      assert.throws(
        () => FlutureTMonetEither.do(function() {}),
        Error
      );
      assert.throws(
        () => FlutureTMonetEither.do(function () {}),
        Error
      );
    });

    it('tests transforming Either result to FlutureTMonetEither', function(done) {
      FlutureTMonetEither.do(function* generator() {
        const valA = yield FlutureTMonetEither.fromValue(1);
        const valB = yield FlutureTMonetEither.fromValue(2);

        return { valA, valB };
      })
        .fork(
          noop,
          (val) => {
            assert.deepEqual(val, { valA: 1, valB: 2 });
            done();
          }
        );
    });

    it('tests map after do', function(done) {
      FlutureTMonetEither.do(function* generator() {
        const result = yield FlutureTMonetEither.fromValue(1);

        return result + 1;
      })
        .map(val => val + 1)
        .fork(
          noop,
          (val) => {
            assert.strictEqual(val, 3);
            done();
          }
        );
    });
  });

  describe('tests filter', function() {
    it('tests successful predicate + transformer', function(done) {
      const transformer = sinon.spy();

      FlutureTMonetEither
        .fromValue(1)
        .filter(val => val === 1, transformer)
        .fork(
          noop,
          (val) => {
            sinon.assert.notCalled(transformer);
            assert.strictEqual(val, 1);
            done();
          }
        );
    });

    describe('tests tryP', () => {
      it('tests calling futureEither.encaseP under the hood', (done) => {
        const expectedVal = undefined;
        const fn = sinon.stub().returns(Promise.resolve(expectedVal));

        FlutureTMonetEither
          .tryP(fn)
          .fork(
            noop,
            (val) => {
              sinon.assert.calledOnce(fn);
              sinon.assert.calledWithExactly(fn, undefined);
              assert.strictEqual(val, expectedVal);
              done();
            }
          );
      });
    });

    describe('mapRej', () => {
      it('tests rejection (remapped)', (done) => {
        FlutureTMonetEither.encaseP(Promise.reject.bind(Promise), 1)
          .mapRej(val => val + 1)
          .promise()
          .catch((e) => {
            assert.strictEqual(e, 2);
            done();
          });
      });

      it('tests rejection (plain)', (done) => {
        FlutureTMonetEither.encaseP(Promise.reject.bind(Promise), 1)
          .map(val => val + 1)
          .promise()
          .catch((e) => {
            assert.strictEqual(e, 1);
            done();
          });
      });
    });

    it('tests unsuccessful predicate + transformer', function(done) {
      const error = new Error('fold left');
      const transformer = sinon.stub().returns(error);

      FlutureTMonetEither
        .fromValue(1)
        .filter(val => val === 2, transformer)
        .fork(
          (val) => {
            sinon.assert.calledOnce(transformer);
            sinon.assert.calledWithExactly(transformer, 1);
            assert.strictEqual(val, error);
            done();
          },
          noop
        );
    });

    it('tests unsuccessful predicate + value', function(done) {
      const error = new Error('fold left');

      FlutureTMonetEither
        .fromValue(1)
        .filter(val => val === 2, error)
        .fork(
          (val) => {
            assert.strictEqual(val, error);
            done();
          },
          noop
        );
    });
  });
});


describe('liftEither', function() {
  it('tests lifting Either into FlutureTMonetEither', function() {
    const a = Either.Right(1);
    const b = liftEither(a);

    assert.isTrue(isFlutureTMonetEither(b));
  });
});


describe('liftFuture', function() {
  it('tests lifting Future into FlutureTMonetEither', function() {
    const a = Future.of(1);
    const b = liftFuture(a);

    assert.isTrue(isFlutureTMonetEither(b));
  });
});


describe('isFlutureTMonetEither', function() {
  it('tests for FlutureTMonetEither instances', function() {
    const fe = FlutureTMonetEither.fromValue(1);

    assert.isTrue(isFlutureTMonetEither(fe));
  });

  it('tests for everything else', function() {
    assert.isFalse(isFlutureTMonetEither(''));
    assert.isFalse(isFlutureTMonetEither(1));
    assert.isFalse(isFlutureTMonetEither(new Date()));
    assert.isFalse(isFlutureTMonetEither({}));
    assert.isFalse(isFlutureTMonetEither([]));
    assert.isFalse(isFlutureTMonetEither(Symbol.for('test')));
    assert.isFalse(isFlutureTMonetEither(new RegExp(/1/g)));
  });
});
