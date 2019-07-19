describe('drawer', function() {
  describe('getWeeksArray function', function() {
    it('should return an array of length 54 for 2019KW52 - 2021KW01', function() {
      assert.lengthOf(getWeeksArray('2019KW52', '2021KW01'), 54);
    });
    it('should return an array of length 50 for 2019KW01 - 2019KW50', function() {
      assert.lengthOf(getWeeksArray('2019KW01', '2019KW50'), 50);
    });
  });
});
