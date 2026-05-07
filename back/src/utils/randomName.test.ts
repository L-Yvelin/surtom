import { funnyNames } from '../data/funnyNames.js';
import { getRandomFunnyName, isFunnyName } from './randomName.js';

describe('getRandomFunnyName', () => {
  it('returns a name from the funnyNames list', () => {
    for (let i = 0; i < 50; i++) {
      expect(funnyNames).toContain(getRandomFunnyName());
    }
  });

  it('uses Math.random to index into the list', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(getRandomFunnyName()).toBe(funnyNames[0]);
    spy.mockReturnValue(0.999999);
    expect(getRandomFunnyName()).toBe(funnyNames[funnyNames.length - 1]);
    spy.mockRestore();
  });
});

describe('isFunnyName', () => {
  it('returns true for any name in the list', () => {
    funnyNames.forEach((name) => {
      expect(isFunnyName(name)).toBe(true);
    });
  });

  it('returns false for unknown names', () => {
    expect(isFunnyName('not-a-funny-name')).toBe(false);
    expect(isFunnyName('')).toBe(false);
    expect(isFunnyName('Surtomien_X')).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(isFunnyName('surtomien')).toBe(false);
    expect(isFunnyName('Surtomien')).toBe(true);
  });
});
