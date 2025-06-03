export declare class AnalyticsQueue {
    private readonly tasks;
    private running;
    static get: import("memoize-one").MemoizedFn<() => AnalyticsQueue>;
    private constructor();
    private request;
    private pending;
    private process;
    schedule(task: Function): void;
}
