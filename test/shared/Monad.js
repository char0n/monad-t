'use strict';

const fl = require('fantasy-land');
const { applyTrait, functorTrait, chainTrait } = require('ramda-adjunct/lib/fantasy-land/traits');

const { aliasesForType } = require('../../src/utils');


class Monad {
  static [fl.of](value) {
    return new Monad(value);
  }

  static get ['@@type']() {
    return 'monad-t/Monad';
  }

  constructor(value) {
    this.value = value;
  }

  [fl.map](fn) {
    return functorTrait[fl.map].call(this, fn);
  }

  [fl.chain](fn) {
    return chainTrait[fl.chain].call(this, fn);
  }

  [fl.ap](applyWithFn) {
    return applyTrait[fl.ap].call(this, applyWithFn);
  }
}

aliasesForType(Monad);


module.exports = Monad;
