import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import App from './index';

// Mock Alert so we can spy on it
jest.spyOn(Alert, 'alert');

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows an alert when trying to start game with insufficient words', async () => {
    render(<App />);

    // Wait for the app to be ready (it has an initial loading state)
    // "Big Bowl" is on the home screen
    const newGameButton = await screen.findByText('New Game');

    // Navigate to Lobby
    fireEvent.press(newGameButton);

    // Verify we are in the Lobby screen by finding the "Start Game" button
    const startGameButton = await screen.findByText('Start Game');

    // Try to start the game without adding words (words.length < 5)
    fireEvent.press(startGameButton);

    // Assert that the alert was called
    expect(Alert.alert).toHaveBeenCalledWith(
      "Not enough words",
      "Please add at least 5 words to the bank."
    );
  });
});