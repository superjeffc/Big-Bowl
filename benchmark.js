const React = require('react');
const { render } = require('@testing-library/react');
const { useState, useEffect, useRef } = React;

function AntiPatternTimer({ isTimerRunning, initialTimeLimit, onTimesUp }) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLimit);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 10);
    } else if (timeLeft === 0 && isTimerRunning) {
      clearInterval(timerRef.current);
      onTimesUp();
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timeLeft, onTimesUp]);

  return React.createElement('div', null, timeLeft);
}

function OptimizedTimer({ isTimerRunning, initialTimeLimit, onTimesUp }) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLimit);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 10);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  useEffect(() => {
    if (timeLeft === 0 && isTimerRunning) {
      clearInterval(timerRef.current);
      onTimesUp();
    }
  }, [timeLeft, isTimerRunning, onTimesUp]);

  return React.createElement('div', null, timeLeft);
}

async function runBenchmark() {
  const ITERATIONS = 1000;

  // Need jsdom for testing library
}
runBenchmark();
