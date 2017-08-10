'use strict';

const { startsWith, over, lensIndex, replace } = require('ramda');


const aliases = (obj) => {
  const propNames = Object.getOwnPropertyNames(obj);

  return propNames
    .filter(startsWith('fantasy-land/'))
    .reduce((accumulator, propName) => {
      accumulator.push([propName, obj[propName]]);
      return accumulator;
    }, [])
    .map(over(lensIndex(0), replace('fantasy-land/', '')));
};

const aliasesForType = (type) => {
  aliases(type).forEach(([alias, fn]) => {
    type[alias] = fn;
  });
  aliases(type.prototype).forEach(([alias, fn]) => {
    type.prototype[alias] = fn;
  });
};


module.exports = {
  aliases,
  aliasesForType,
};
