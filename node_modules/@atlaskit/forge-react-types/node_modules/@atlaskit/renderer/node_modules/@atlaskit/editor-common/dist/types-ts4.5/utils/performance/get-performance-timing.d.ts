/**
 * Calculate the difference between performance.now() and the given startTime.
 * This allows for the timing to be overridable during tests.
 *
 * @param startTime DOMHighResTimeStamp
 * @returns DOMHighResTimeStamp
 */
export declare const getTimeSince: (startTime: DOMHighResTimeStamp) => DOMHighResTimeStamp;
