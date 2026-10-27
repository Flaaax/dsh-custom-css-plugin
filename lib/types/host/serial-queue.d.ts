/** 让所有状态操作依提交顺序执行；单个失败不会毒化后续队列。 */
export declare class SerialQueue {
    private tail;
    run<T>(operation: () => Promise<T>): Promise<T>;
}
