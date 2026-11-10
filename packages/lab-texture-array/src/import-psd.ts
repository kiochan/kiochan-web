import type { PsdImportCommand, PsdImportReply } from "./import.worker";

export class PsdImportClient {
  private worker = new Worker(new URL("./import.worker.ts", import.meta.url), {
    type: "module",
  });
  private reject: ((error: Error) => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private stopped = false;

  get closed() {
    return this.stopped;
  }

  request(command: PsdImportCommand): Promise<PsdImportReply> {
    if (this.stopped) return Promise.reject(new Error("PSD import cancelled."));
    return new Promise((resolve, reject) => {
      const fail = (error: Error) => {
        clearTimeout(this.timer);
        this.reject = null;
        reject(error);
      };
      this.reject = fail;
      const fatal = (error: Error) => {
        this.stopped = true;
        this.worker.terminate();
        fail(error);
      };
      this.timer = setTimeout(() => {
        fatal(new Error("PSD import timed out. Choose a smaller file."));
      }, 60_000);
      this.worker.onerror = () =>
        fatal(new Error("Unable to read PSD layers."));
      this.worker.onmessageerror = () =>
        fatal(new Error("Unable to read PSD layers."));
      this.worker.onmessage = (event: MessageEvent<PsdImportReply>) => {
        if (event.data.error) fail(new Error(event.data.error));
        else {
          clearTimeout(this.timer);
          this.reject = null;
          resolve(event.data);
        }
      };
      try {
        this.worker.postMessage(
          command,
          command.type === "open" ? [command.buffer] : [],
        );
      } catch {
        fatal(new Error("Unable to read PSD layers."));
      }
    });
  }
  dispose() {
    this.stopped = true;
    clearTimeout(this.timer);
    this.worker.terminate();
    this.reject?.(new Error("PSD import cancelled."));
    this.reject = null;
  }
}
