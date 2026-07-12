import { shuffle } from '../index';

describe('shuffle function', () => {
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on Math.random to mock its implementation for predictable tests
    mathRandomSpy = jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    // Restore the original Math.random after each test
    mathRandomSpy.mockRestore();
  });

  it('should return an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle([...input]);
    expect(result.length).toBe(input.length);
  });

  it('should contain the exact same elements', () => {
    const input = ['apple', 'banana', 'cherry'];
    const result = shuffle([...input]);

    // Create sorted versions to compare
    const sortedInput = [...input].sort();
    const sortedResult = [...result].sort();

    expect(sortedResult).toEqual(sortedInput);
  });

  it('should correctly swap elements based on mocked random values', () => {
    const input = ['A', 'B', 'C', 'D'];

    // We mock Math.random to return specific values to deterministically
    // control the `randomIndex = Math.floor(Math.random() * currentIndex)`
    // currentIndex goes from 4 down to 1
    // Loop 1: currentIndex = 4, we want randomIndex = 0 -> Math.random() returns 0.1 (0.1 * 4 = 0.4 -> floor -> 0)
    // Loop 2: currentIndex = 3, we want randomIndex = 1 -> Math.random() returns 0.5 (0.5 * 3 = 1.5 -> floor -> 1)
    // Loop 3: currentIndex = 2, we want randomIndex = 0 -> Math.random() returns 0.1 (0.1 * 2 = 0.2 -> floor -> 0)
    // Loop 4: currentIndex = 1, we want randomIndex = 0 -> Math.random() returns 0.1 (0.1 * 1 = 0.1 -> floor -> 0)
    mathRandomSpy
      .mockReturnValueOnce(0.1) // index 0
      .mockReturnValueOnce(0.5) // index 1
      .mockReturnValueOnce(0.1) // index 0
      .mockReturnValueOnce(0.1); // index 0

    // Manual trace of Fisher-Yates:
    // Initial: ['A', 'B', 'C', 'D']
    // i=4, rand=0. Swap [3]('D') and [0]('A'): ['D', 'B', 'C', 'A']
    // i=3, rand=1. Swap [2]('C') and [1]('B'): ['D', 'C', 'B', 'A']
    // i=2, rand=0. Swap [1]('C') and [0]('D'): ['C', 'D', 'B', 'A']
    // i=1, rand=0. Swap [0]('C') and [0]('C'): ['C', 'D', 'B', 'A']

    const result = shuffle([...input]);
    expect(result).toEqual(['C', 'D', 'B', 'A']);
  });

  it('should handle an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('should handle a single-element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});
