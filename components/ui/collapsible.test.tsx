import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Collapsible } from './collapsible';
import { Text } from 'react-native';

describe('Collapsible', () => {
  it('renders the title and toggles content on press', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Test Title">
        <Text>Hidden Content</Text>
      </Collapsible>
    );

    // Initially, the title should be there, but the content should not be visible.
    expect(getByText('Test Title')).toBeTruthy();
    expect(queryByText('Hidden Content')).toBeNull();

    // Press the title
    fireEvent.press(getByText('Test Title'));

    // Content should now be visible
    expect(getByText('Hidden Content')).toBeTruthy();

    // Press the title again
    fireEvent.press(getByText('Test Title'));

    // Content should be hidden again
    expect(queryByText('Hidden Content')).toBeNull();
  });
});
