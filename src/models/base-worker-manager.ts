import * as Comlink from "comlink";

export abstract class BaseWorkerManager<T> {
  protected worker: Worker | null = null;
  protected workerProxy: Comlink.Remote<T> | null = null;
  protected _isInitializing = false;
  protected _isTerminated = false;

  protected abstract getWorkerUrl(): URL;
  protected abstract getWorkerOptions(): WorkerOptions;

  async initWorker(): Promise<void> {
    if (this._isInitializing || this.workerProxy) {
      return;
    }

    if (this._isTerminated) {
      throw new Error(
        `${this.constructor.name} has been terminated and cannot be reused`,
      );
    }

    this._isInitializing = true;

    try {
      this.worker = new Worker(this.getWorkerUrl(), this.getWorkerOptions());
      this.workerProxy = Comlink.wrap<T>(this.worker);
    } catch (error) {
      this.terminate();
      throw new Error(`Failed to initialize worker: ${error}`);
    } finally {
      this._isInitializing = false;
    }
  }

  protected async callWorkerMethod<M extends keyof T>(
    method: M,
    ...args: T[M] extends (...args: any[]) => any ? Parameters<T[M]> : never
  ): Promise<T[M] extends (...args: any[]) => any ? ReturnType<T[M]> : never> {
    if (!this.workerProxy) {
      throw new Error("Worker not initialized. Call init() first.");
    }

    if (this._isTerminated) {
      throw new Error(`${this.constructor.name} has been terminated`);
    }

    const methodFn = (this.workerProxy as any)[method];

    if (typeof methodFn !== "function") {
      throw new Error(`Method ${String(method)} not found on worker`);
    }

    try {
      return await methodFn(...args);
    } catch (error) {
      throw new Error(`Worker method ${String(method)} failed: ${error}`);
    }
  }

  protected async callCleanupIfExists(): Promise<void> {
    if (this.workerProxy && "cleanup" in this.workerProxy) {
      const cleanupFn = (this.workerProxy as any).cleanup;
      if (typeof cleanupFn === "function") {
        try {
          await cleanupFn();
        } catch (error) {
          console.warn("Error during worker cleanup:", error);
        }
      }
    }
  }

  terminate(): void {
    this._isTerminated = true;
    this._isInitializing = false;

    this.callCleanupIfExists().finally(() => {
      this.worker?.terminate();
      this.worker = null;
      this.workerProxy = null;
    });
  }

  get isReady(): boolean {
    return !!this.workerProxy && !this._isInitializing && !this._isTerminated;
  }

  get isInitializing(): boolean {
    return this._isInitializing;
  }

  get isTerminated(): boolean {
    return this._isTerminated;
  }
}
