'use strict';

describe('Service: StandardFuncsService', function () {
  beforeEach(angular.mock.module('artic'));

  it('should remove underscore-prefixed keys from a flat object', angular.mock.inject(function (StandardFuncsService) {
    var obj = { a: 1, _b: 2, c: 3 };
    StandardFuncsService.traverseAndClean(obj);
    expect(obj.a).toBe(1);
    expect(obj.c).toBe(3);
    expect(obj._b).toBeUndefined();
  }));

  it('should recursively remove underscore-prefixed keys from nested objects', angular.mock.inject(function (StandardFuncsService) {
    var obj = {
      keep: 'yes',
      _remove: 'no',
      nested: {
        also: 'keep',
        _gone: 'removed',
        deep: {
          _hidden: true,
          visible: false
        }
      }
    };
    StandardFuncsService.traverseAndClean(obj);
    expect(obj.keep).toBe('yes');
    expect(obj._remove).toBeUndefined();
    expect(obj.nested.also).toBe('keep');
    expect(obj.nested._gone).toBeUndefined();
    expect(obj.nested.deep._hidden).toBeUndefined();
    expect(obj.nested.deep.visible).toBe(false);
  }));

  it('should return a reversed copy without mutating the original', angular.mock.inject(function (StandardFuncsService) {
    var original = [1, 2, 3, 4];
    var reversed = StandardFuncsService.reverseCopy(original);
    expect(reversed).toEqual([4, 3, 2, 1]);
    expect(original).toEqual([1, 2, 3, 4]);
  }));
});
