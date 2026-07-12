import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react-native';
import App from '../app/(tabs)/index';

// Mock timers
jest.useFakeTimers();

describe('App', () => {
  it('updates score and active words on correct answer', async () => {
    render(<App />);

    // Wait for app to be ready (resolve the async delay in the component)
    await act(async () => {
      await Promise.resolve();
    });

    // We should be on HOME screen
    expect(screen.getByText('New Game')).toBeTruthy();

    // Go to Lobby
    fireEvent.press(screen.getByText('New Game'));

    // We should be on LOBBY screen
    expect(screen.getByText('Word Bank')).toBeTruthy();

    // Add 5 words
    const input = screen.getByPlaceholderText('Enter a word/phrase');
    const addButton = screen.getByText('Add Word');

    for (let i = 1; i <= 5; i++) {
      fireEvent.changeText(input, `Word ${i}`);
      fireEvent.press(addButton);
    }

    // Start Game
    const startGameButton = screen.getByText('Start Game');
    expect(startGameButton).toBeTruthy();
    fireEvent.press(startGameButton);

    // Turn Start
    expect(screen.getByText("Team 1's Turn")).toBeTruthy();
    expect(screen.getByText('Team 1: 0')).toBeTruthy();
    expect(screen.getByText('Team 2: 0')).toBeTruthy();

    // Begin round
    fireEvent.press(screen.getByText('Begin'));

    // Gameplay
    expect(screen.getByText('Words Remaining: 5')).toBeTruthy();

    // Press Correct
    fireEvent.press(screen.getByText('Correct!'));

    // Check words remaining
    expect(screen.getByText('Words Remaining: 4')).toBeTruthy();

    // Exhaust remaining words
    fireEvent.press(screen.getByText('Correct!'));
    fireEvent.press(screen.getByText('Correct!'));
    fireEvent.press(screen.getByText('Correct!'));
    fireEvent.press(screen.getByText('Correct!'));

    // Round over
    expect(screen.getByText('Round Complete!')).toBeTruthy();
    fireEvent.press(screen.getByText('Continue'));

    // Next turn start (Round 2)
    expect(screen.getByText('Round 2')).toBeTruthy();

    // Score should be updated for Team 1
    expect(screen.getByText('Team 1: 5')).toBeTruthy();
    expect(screen.getByText('Team 2: 0')).toBeTruthy();
  });
});
