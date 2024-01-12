import { useRef } from 'react';

const DEFAULT_TIMER_ID = -1;

export interface TimerData {
  timerId: number;
  startTime: number;
  totalRunTime: number;
}

export const useTimer = (fn: () => void, countdown: number) => {
  const timerRef = useRef<TimerData>({
    timerId: DEFAULT_TIMER_ID,
    startTime: 0,
    totalRunTime: 0,
  });

  function _resetVariables() {
    timerRef.current.timerId = DEFAULT_TIMER_ID;
    timerRef.current.totalRunTime = 0;
    timerRef.current.startTime = 0;
  }

  function clearTimer() {
    window.clearTimeout(timerRef.current.timerId);
    _resetVariables();
  }

  function startTimer() {
    timerRef.current.startTime = new Date().getTime();
    timerRef.current.timerId = window.setTimeout(fn, countdown);
  }

  function pauseTimer() {
    if (timerRef.current.timerId === DEFAULT_TIMER_ID) {
      return;
    }

    window.clearTimeout(timerRef.current.timerId);
    timerRef.current.timerId = DEFAULT_TIMER_ID;
    timerRef.current.totalRunTime +=
      new Date().getTime() - timerRef.current.startTime;
  }

  function resumeTimer() {
    if (timerRef.current.totalRunTime >= countdown) {
      clearTimer();
    } else {
      pauseTimer();
      timerRef.current.timerId = window.setTimeout(
        fn,
        countdown - timerRef.current.totalRunTime
      );
      timerRef.current.startTime = new Date().getTime();
    }
  }

  return {
    startTimer,
    pauseTimer,
    resumeTimer,
    clearTimer,
  };
};
