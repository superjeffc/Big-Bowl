import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import App from './index';
import { Vibration } from 'react-native';

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Vibration = { vibrate: jest.fn() };
  return rn;
});

describe('App - Timer expiration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('handles timer expiration and switches team correctly', async () => {
    render(<App />);

    // The component has a small delay initially, wait for it
    await waitFor(() => {
      expect(screen.getByText('New Game')).toBeTruthy();
    });

    // 1. Go to Lobby
    fireEvent.press(screen.getByText('New Game'));

    // 2. Add 5 words
    const input = screen.getByPlaceholderText('Enter a word/phrase');
    const addButton = screen.getByText('Add Word');

    for (let i = 1; i <= 5; i++) {
      fireEvent.changeText(input, `word${i}`);
      fireEvent.press(addButton);
    }

    // 3. Start Game
    const startButton = screen.getByText('Start Game');
    fireEvent.press(startButton);

    // 4. Verify Turn Start for Team 1
    await waitFor(() => {
      expect(screen.getByText("Team 1's Turn")).toBeTruthy();
    });

    // 5. Begin Turn
    fireEvent.press(screen.getByText('Begin'));

    // 6. Wait for gameplay screen
    await waitFor(() => {
      expect(screen.getByText('Correct!')).toBeTruthy();
    });

    // 7. Advance timers to trigger time up (60 seconds)
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    // 8. Verify Time's Up screen
    await waitFor(() => {
      expect(screen.getByText("Time's Up!")).toBeTruthy();
    });

    // 9. Click pass device
    fireEvent.press(screen.getByText('Pass Device to Next Team'));

    // 10. Verify switch to Team 2
    await waitFor(() => {
      expect(screen.getByText("Team 2's Turn")).toBeTruthy();
    });
  });
});
