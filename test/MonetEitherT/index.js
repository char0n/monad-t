'use strict';

const chai = require('chai');
const { Either, Identity } = require('monet');
const { Future } = require('fluture');

const Monad = require('../shared/Monad');
const MonetEitherT = require('../../src/MonetEitherT');
const FlutureTMonetEither = require('../../src/FlutureTMonetEither');


describe('MonetEitherT', function() {
  describe('constructor', function() {
    describe('call as a static function', function() {
      it('should return instance of Either when Identity monad provided', function() {
        const monad = MonetEitherT(Identity.of(1));

        chai.assert.instanceOf(monad, Either.fn.init);
        chai.assert.equal(1, monad.right());
      });

      it('should return instance of MonetEitherT when Unknown monad provided', function() {
        const monad = MonetEitherT(Monad.of(1));

        chai.assert.instanceOf(monad, MonetEitherT);
      });

      it('should return instance of FlutureTMonetEither when Fluture monad provided', function() {
        const monad = MonetEitherT(Future.of(1));

        chai.assert.instanceOf(monad, FlutureTMonetEither);
      });

      it('should return instance of FlutureTMonetEither when Either monad provided', function() {
        const monad = MonetEitherT(Either.Right(1));

        chai.assert.instanceOf(monad, FlutureTMonetEither);
      });
    });
  });
});
