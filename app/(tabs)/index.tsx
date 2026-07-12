import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';

// --- GAME CONSTANTS ---
const ROUNDS = [
  { id: 1, name: "TABOO", desc: "Use phrases/sentences. No saying the word!" },
  { id: 2, name: "CHARADES", desc: "Gestures only. No talking!" },
  { id: 3, name: "PASSWORD", desc: "One word clue only!" }
];
const TIME_LIMIT = 60;

// --- HELPER FUNCTIONS ---
// Fisher-Yates Shuffle
export const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export default function App() {
  // --- STATE MANAGEMENT ---
  const [screen, setScreen] = useState('HOME'); // HOME, HOW_TO, LOBBY, TURN_START, GAMEPLAY, TIMES_UP, ROUND_OVER, GAME_OVER
  const [words, setWords] = useState([]);
  const [activeWords, setActiveWords] = useState([]); // Words currently in play for the round
  const [inputValue, setInputValue] = useState("");
  const [appIsReady, setAppIsReady] = useState(false);

  // Game State
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(1);
  const [roundIndex, setRoundIndex] = useState(0); // 0 = Round 1, etc.

  // Gameplay State
  const [currentWord, setCurrentWord] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Refs for timer management
  const timerRef = useRef(null);

  // --- LOGIC: NAVIGATION & FLOW ---

  const resetGame = () => {
    setWords([]);
    setActiveWords([]);
    setTeam1Score(0);
    setTeam2Score(0);
    setCurrentTeam(1);
    setRoundIndex(0);
    setScreen('HOME');
  };

  const startGame = () => {
    if (words.length < 5) {
      Alert.alert("Not enough words", "Please add at least 5 words to the bank.");
      return;
    }
    // Deep copy words to active words and shuffle
    const shuffled = shuffle([...words]);
    setActiveWords(shuffled);
    setRoundIndex(0);
    setScreen('TURN_START');
  };

  const startTurn = () => {
    // Pick the first word
    if (activeWords.length > 0) {
      setCurrentWord(activeWords[0]);
    }
    setTimeLeft(TIME_LIMIT);
    setIsTimerRunning(true);
    setScreen('GAMEPLAY');
  };

  const handleCorrect = () => {
    // 1. Update Score
    if (currentTeam === 1) setTeam1Score(s => s + 1);
    else setTeam2Score(s => s + 1);

    // 2. Remove current word from active pool
    const newActiveWords = activeWords.slice(1); // Remove the first element (current word)
    setActiveWords(newActiveWords);

    // 3. Check if Round Complete
    if (newActiveWords.length === 0) {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      setScreen('ROUND_OVER');
    } else {
      // 4. Show next word
      setCurrentWord(newActiveWords[0]);
    }
  };

  const handleSkipOrTimeUp = () => {
    // If timer runs out, the current word is NOT removed.
    // It gets shuffled back into the remaining pool for the next team.
    clearInterval(timerRef.current);
    setIsTimerRunning(false);

    // Shuffle remaining words so the current one isn't immediately next
    const shuffledRemaining = shuffle([...activeWords]);
    setActiveWords(shuffledRemaining);

    // Switch Team
    setCurrentTeam(prev => prev === 1 ? 2 : 1);
    setScreen('TURN_START');
  };

  const nextRound = () => {
    const nextRoundIdx = roundIndex + 1;
    if (nextRoundIdx >= ROUNDS.length) {
      setScreen('GAME_OVER');
    } else {
      setRoundIndex(nextRoundIdx);
      // Reset words for the new round (reuse the original full list)
      setActiveWords(shuffle([...words]));
      setCurrentTeam(currentTeam === 1 ? 2 : 1); // Losing team usually goes first, or just swap
      setScreen('TURN_START');
    }
  };

  // --- EFFECT: TIMER ---
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      // Time is up
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      Vibration.vibrate([0, 500, 200, 500]); // Haptic feedback
      setScreen('TIMES_UP');
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timeLeft]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = "Big Bowl | Word Party Game";
    }
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulating a tiny delay for the dictionary setup
        setAppIsReady(true);
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, []);

  // --- RENDERERS ---

  const renderHome = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>Big Bowl</Text>
      <Text style={styles.subtitle}>A word party game</Text>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => setScreen('LOBBY')}>
        <Text style={styles.btnText}>New Game</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHowTo = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.header}>How to Play</Text>
      <Text style={styles.rulesText}>
        1. Press New Game.{'\n\n'}
        2. Everyone adds difficult words to the "Big Bowl" (recommended at least 5 words per person). Then, press Start Game.{'\n\n'}
        3. Divide into two teams and decide which team will start. Then, press Begin.{'\n\n'}
        4. Play 3 rounds: {'\n\n'}
          {'\t'} <Text style={{fontWeight:'bold'}}>Round 1 (Taboo):</Text> Describe the word using sentences, but don't say the word itself.{'\n\n'}
          {'\t'} <Text style={{fontWeight:'bold'}}>Round 2 (Charades):</Text> Act it out. No talking!{'\n\n'}
          {'\t'} <Text style={{fontWeight:'bold'}}>Round 3 (Password):</Text> One word clue only.{'\n\n'}
        5. Pass the device to the other team when the timer runs out.{'\n\n'}
        6. Good luck and have fun!{'\n\n'}
      </Text>
      <TouchableOpacity style={styles.btnSecondary} onPress={() => setScreen('HOME')}>
        <Text style={styles.btnText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderLobby = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.header}>Word Bank</Text>
      <Text style={styles.subtitle}>Count: {words.length}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter a word/phrase"
        value={inputValue}
        onChangeText={setInputValue}
        maxLength={30}
      />

      <TouchableOpacity
        style={styles.btnSmall}
        onPress={() => {
          if(inputValue.trim().length > 0) {
            setWords([...words, inputValue.trim()]);
            setInputValue("");
          }
        }}
      >
        <Text style={styles.btnText}>Add Word</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {words.length >= 5 && (
      <TouchableOpacity style={[styles.btnPrimary, {backgroundColor: '#4ade80'}]} onPress={startGame}>
        <Text style={styles.btnText}>Start Game</Text>
      </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.btnSecondary, {backgroundColor: '#f87171'}]} onPress={handleBack}>
        <Text style={styles.btnText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTurnStart = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.header}>Round {roundIndex + 1}</Text>
      <Text style={styles.subHeader}>{ROUNDS[roundIndex].name}</Text>
      <Text style={styles.text}>{ROUNDS[roundIndex].desc}</Text>

      <View style={styles.scoreBoard}>
        <Text style={styles.scoreText}>Team 1: {team1Score}</Text>
        <Text style={styles.scoreText}>Team 2: {team2Score}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Team {currentTeam}'s Turn</Text>
        <Text style={styles.cardSub}>Words remaining: {activeWords.length}</Text>
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={startTurn}>
        <Text style={styles.btnText}>Begin</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGameplay = () => (
    <View style={styles.centerContainer}>
      <Text style={[styles.timer, {color: timeLeft <= 10 ? 'red' : '#333'}]}>
        Time Left: {'\n'}{timeLeft}
      </Text>

      <Text style={[styles.words, {color: '#333'}]}>
        Words Remaining: {activeWords.length}
      </Text>

      <View style={styles.wordCard}>
        <Text style={styles.wordText}>{currentWord}</Text>
      </View>

      <TouchableOpacity
        style={[styles.btnPrimary, {backgroundColor: '#4ade80', height: 80}]}
        onPress={handleCorrect}
      >
        <Text style={[styles.btnText, {fontSize: 24}]}>Correct!</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimesUp = () => (
    <View style={[styles.centerContainer, {backgroundColor: '#ef4444'}]}>
      <Text style={[styles.header, {color: 'white', fontSize: 50}]}>Time's Up!</Text>
      <TouchableOpacity style={styles.btnSecondary} onPress={handleSkipOrTimeUp}>
        <Text style={styles.btnText}>Pass Device to Next Team</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRoundOver = () => (
    <View style={[styles.centerContainer, {backgroundColor: '#4ade80'}]}>
      <Text style={[styles.header, {color: 'white'}]}>Round Complete!</Text>
      <TouchableOpacity style={styles.btnSecondary} onPress={nextRound}>
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGameOver = () => {
    let winner = "It's a Tie!";
    if (team1Score > team2Score) winner = "Team 1 Wins!";
    if (team2Score > team1Score) winner = "Team 2 Wins!";

    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.header, {color: '#ef4444'}]}>{winner}</Text>
        <View style={styles.scoreBoard}>
          <Text style={[styles.scoreText, {fontSize: 24}]}>Team 1: {team1Score}</Text>
          <Text style={[styles.scoreText, {fontSize: 24}]}>Team 2: {team2Score}</Text>
        </View>
        <TouchableOpacity style={styles.btnPrimary} onPress={resetGame}>
          <Text style={styles.btnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleBack = () => {
    // 1. If the lobby is empty, just go back immediately
    if (words.length === 0) {
      resetGame();
      return;
    }

    // 2. Handle Web Browsers (Alert.alert doesn't always look good on web)
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to leave? Your words will be lost.");
      if (confirmed) resetGame();
    }
    // 3. Handle iOS and Android
    else {
      Alert.alert(
        "Leave Lobby?", // Title
        "Are you sure you want to leave? Your words will be lost.", // Message
        [
          { text: "Cancel", style: "cancel" }, // Button 1
          { text: "Leave", style: "destructive", onPress: resetGame } // Button 2
        ]
      );
    }
  };

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {screen === 'HOME' && renderHome()}
      {screen === 'HOW_TO' && renderHowTo()}
      {screen === 'LOBBY' && renderLobby()}
      {screen === 'TURN_START' && renderTurnStart()}
      {screen === 'GAMEPLAY' && renderGameplay()}
      {screen === 'TIMES_UP' && renderTimesUp()}
      {screen === 'ROUND_OVER' && renderRoundOver()}
      {screen === 'GAME_OVER' && renderGameOver()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 30,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    // width: '100%',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3b82f6',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  rulesText: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 5,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    width: '80%',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    width: '80%',
    marginVertical: 20,
  },
  scoreBoard: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#e0f2fe',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '80%',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSub: {
    fontSize: 16,
    color: '#555',
  },
  wordCard: {
    padding: 40,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 15,
    marginBottom: 50,
    width: '90%',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timer: {
    textAlign: 'center',
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  words: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 30,
  },
  btnPrimary: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: '#9ca3af',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  btnSmall: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 150,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    fontStyle: 'italic',
  },
});