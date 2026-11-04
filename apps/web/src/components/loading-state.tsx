import { Localized } from "@/components/language-provider";
export function LoadingState({ label = "Loading page" }: { label?: string }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-heading">
        <span className="status-light" aria-hidden="true" />
        <span>
          <Localized text={label} />
        </span>
      </div>
      <div className="loading-line" aria-hidden="true" />
      <div className="loading-line loading-line-short" aria-hidden="true" />
      <div className="loading-stage" aria-hidden="true">
        <span className="loading-orbit" />
      </div>
      <span className="sr-only">
        <Localized text="Please wait. The content will appear here." />{" "}
      </span>
    </div>
  );
}
