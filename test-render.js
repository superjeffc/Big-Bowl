const React = require('react');
const { useState, useEffect, useRef } = React;
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = { userAgent: 'node.js' };
global.requestAnimationFrame = function (callback) { return setTimeout(callback, 0); };
global.cancelAnimationFrame = function (id) { clearTimeout(id); };

// Require ReactDOM after setting up DOM
const ReactDOM = require('react-dom/client');
const { act } = require('react');

// The original pattern from the codebase
function AntiPatternTimer({ initialTimeLimit, onTimesUp }) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLimit);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef(null);

  // We want to count how many times the effect cleans up and sets up
  const setupCount = useRef(0);

  useEffect(() => {
    setupCount.current++;
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 0); // fastest interval for testing
    } else if (timeLeft === 0 && isTimerRunning) {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      if (onTimesUp) onTimesUp(setupCount.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timeLeft, onTimesUp]);

  return null;
}

// The optimized pattern
function OptimizedTimer({ initialTimeLimit, onTimesUp }) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLimit);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef(null);

  const setupCount = useRef(0);

  useEffect(() => {
    setupCount.current++;
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            if (onTimesUp) onTimesUp(setupCount.current);
            return 0;
          }
          return prev - 1;
        });
      }, 0); // fastest interval for testing
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, onTimesUp]);

  return null;
}

async function runTest() {
  const timeLimit = 1000;
  let root1, root2;

  const p1 = new Promise(resolve => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    root1 = ReactDOM.createRoot(div);

    act(() => {
      root1.render(React.createElement(AntiPatternTimer, {
        initialTimeLimit: timeLimit,
        onTimesUp: (setups) => {
          resolve(setups);
        }
      }));
    });
  });

  const p2 = new Promise(resolve => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    root2 = ReactDOM.createRoot(div);

    act(() => {
      root2.render(React.createElement(OptimizedTimer, {
        initialTimeLimit: timeLimit,
        onTimesUp: (setups) => {
          resolve(setups);
        }
      }));
    });
  });

  const start1 = performance.now();
  const setups1 = await p1;
  const end1 = performance.now();

  const start2 = performance.now();
  const setups2 = await p2;
  const end2 = performance.now();

  console.log(`Original Pattern: ${end1 - start1}ms (Effect Setups: ${setups1})`);
  console.log(`Optimized Pattern: ${end2 - start2}ms (Effect Setups: ${setups2})`);

  process.exit(0);
}

runTest().catch(console.error);
