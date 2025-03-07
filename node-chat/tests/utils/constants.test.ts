import Constants from '../src/utils/constants';

describe('Constants', () => {
  it('should have funny names', () => {
    expect(Constants.funnyNames).toContain('Surtomien');
    expect(Constants.funnyNames).toContain('Cracotto');
  });

  it('should have MAX_MESSAGES_LOADED', () => {
    expect(Constants.MAX_MESSAGES_LOADED).toBe(300);
  });
});
