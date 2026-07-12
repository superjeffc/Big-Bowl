import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../index';

describe('App resetGame', () => {
  it('resets all state correctly after a game', async () => {
    const { getByText, getByPlaceholderText, queryByText, getAllByText } = render(<App />);

    // Wait for the app to be ready
    await waitFor(() => {
      expect(getByText('New Game')).toBeTruthy();
    });

    // 1. Go to Lobby
    fireEvent.press(getByText('New Game'));
    expect(getByText('Word Bank')).toBeTruthy();

    // 2. Add 5 words
    let input = getByPlaceholderText('Enter a word/phrase');
    let addButton = getByText('Add Word');

    for (let i = 0; i < 5; i++) {
      fireEvent.changeText(input, `word${i}`);
      fireEvent.press(addButton);
    }

    expect(getByText('Count: 5')).toBeTruthy();

    // 3. Start Game (TURN_START)
    fireEvent.press(getByText('Start Game'));
    expect(getByText('Round 1')).toBeTruthy();

    // 4. Play through all 3 rounds
    for (let round = 1; round <= 3; round++) {
      // Start Turn (GAMEPLAY)
      fireEvent.press(getByText('Begin'));

      // Get all 5 words correct
      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText('Correct!'));
      }

      // We are now at ROUND_OVER screen or GAME_OVER screen.
      // If round < 3, we expect ROUND_OVER. If round == 3, nextRound logic takes us to GAME_OVER.
      // Wait, let's trace `nextRound`. `nextRoundIdx >= ROUNDS.length` triggers GAME_OVER.
      // ROUNDS.length = 3.
      // After round 1 finishes, handleCorrect calls `setScreen('ROUND_OVER')`.
      // We click "Continue" which calls `nextRound`.

      expect(getByText('Round Complete!')).toBeTruthy();
      fireEvent.press(getByText('Continue'));

      if (round < 3) {
        expect(getByText(`Round ${round + 1}`)).toBeTruthy();
      }
    }

    // GAME_OVER screen
    expect(getByText('Play Again')).toBeTruthy();
    // At least one team should have points, meaning state was mutated
    expect(queryByText('Team 1: 0') && queryByText('Team 2: 0')).toBeFalsy();

    // 5. Trigger resetGame
    fireEvent.press(getByText('Play Again'));

    // 6. Verify reset state
    // - Should be on HOME screen
    expect(getByText('Big Bowl')).toBeTruthy();
    expect(getByText('New Game')).toBeTruthy();

    // - Go back to LOBBY to verify words count and game state
    fireEvent.press(getByText('New Game'));
    expect(getByText('Count: 0')).toBeTruthy(); // Words reset

    // Add 5 words again to check if round and scores are reset on next game
    // We need to re-query the elements because the screen has unmounted and remounted
    input = getByPlaceholderText('Enter a word/phrase');
    addButton = getByText('Add Word');

    for (let i = 0; i < 5; i++) {
      fireEvent.changeText(input, `word${i}`);
      fireEvent.press(addButton);
    }
    fireEvent.press(getByText('Start Game'));

    expect(getByText('Round 1')).toBeTruthy(); // Round index reset
    expect(getByText("Team 1's Turn")).toBeTruthy(); // Current team reset

    const team1Scores = getAllByText('Team 1: 0');
    expect(team1Scores.length).toBeGreaterThan(0); // Scores reset
  });
});
