import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text
} from 'react-native';

export default function RulesTab() {
  const renderHowTo = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.header}>How to Play</Text>
      <Text style={styles.rulesText}>
        1. Press New Game.{'\n\n'}
        2. Everyone adds words to the Word Bank (recommended at least 5 words per person). Then, press Start Game.{'\n\n'}
        3. Divide into two teams and decide which team will start. Then, press Begin.{'\n\n'}
        4. Play 3 rounds: {'\n\n'}
          {'\t'} <Text style={{fontWeight:'bold'}}>Round 1 (Taboo):</Text> Describe the word using sentences, but don't say the word itself.{'\n\n'}
          {'\t'} <Text style={{fontWeight:'bold'}}>Round 2 (Charades):</Text> Act it out. No talking!{'\n\n'}
          {'\t'} <Text style={{fontWeight:'bold'}}>Round 3 (Password):</Text> One word clue only.{'\n\n'}
        5. Pass the device to the other team when the timer runs out.{'\n\n'}
        6. Good luck and have fun!{'\n\n'}
      </Text>
    </ScrollView>
  );

  return (
    renderHowTo()
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  rulesText: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 5,
    lineHeight: 20,
  },
});