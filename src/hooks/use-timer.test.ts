import React from 'react';
import { useTimer, TimerData } from './use-timer';

describe('Timer tests', () => {
  jest.spyOn(globalThis, 'setTimeout');
  jest.spyOn(globalThis, 'clearTimeout');

  const mockTimerRef: TimerData = {
    timerId: -1,
    startTime: 0,
    totalRunTime: 0,
  };
  jest.spyOn(React, 'useRef').mockReturnValue({
    current: mockTimerRef,
  });
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  it('should start the timer properly', () => {
    const mockCallbackFn = jest.fn();
    const countDown = 5000;
    const { startTimer } = useTimer(mockCallbackFn, countDown);
    startTimer();
    expect(mockTimerRef.startTime).toBeGreaterThan(0);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledWith(mockCallbackFn, countDown);
    expect(mockTimerRef.timerId).toBeGreaterThan(0);
  });

  it('should pause and resume the timer properly', () => {
    const mockCallbackFn = jest.fn();
    const countDown = 5000;
    const { startTimer, pauseTimer, resumeTimer } = useTimer(
      mockCallbackFn,
      countDown
    );
    startTimer();
    // pause timer
    pauseTimer();
    expect(clearTimeout).toHaveBeenCalledTimes(1);

    // resume timer
    resumeTimer();
    expect(setTimeout).toHaveBeenCalledTimes(2);
    expect(setTimeout).toHaveBeenCalledWith(mockCallbackFn, expect.anything());
  });

  it('should invoke callback only once even if `resumeTimer` is called repeatedly', () => {
    const mockCallbackFn = jest.fn();
    const { startTimer, pauseTimer, resumeTimer } = useTimer(
      mockCallbackFn,
      5000
    );
    startTimer();
    pauseTimer();
    jest.runAllTimers();
    expect(mockCallbackFn).toHaveBeenCalledTimes(0);

    resumeTimer();
    resumeTimer();
    resumeTimer();
    jest.runAllTimers();
    expect(mockCallbackFn).toHaveBeenCalledTimes(1);
  });
});
