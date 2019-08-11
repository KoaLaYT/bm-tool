// test for drawer
describe('drawer', function() {
  describe('getWeeksArray function', function() {
    it('should return an array of length 54 for 2019-KW52 - 2021-KW01', function() {
      assert.lengthOf(getWeeksArray('2019-KW52', '2021-KW01'), 54);
    });
    it('should return an array of length 50 for 2019-KW01 - 2019-KW50', function() {
      assert.lengthOf(getWeeksArray('2019-KW01', '2019-KW50'), 50);
    });
  });

  describe('getFullWeeksArray function', function() {
    it(`should return ['2019-KW02', '2019-KW03', '2019-KW04', '2019-KW05'] for 2019-KW02 - 2021-KW05`, function() {
      assert.deepEqual(getFullWeeksArray('2019-KW02', '2019-KW05'), ['2019-KW02', '2019-KW03', '2019-KW04', '2019-KW05']);
    });
  });
});

// test for merge
describe('merger', function() {
  describe('', function() {
    it('', function() {});
  });
});
