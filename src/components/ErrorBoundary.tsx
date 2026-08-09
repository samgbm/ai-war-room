"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Unknown fault vector",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AI War Room] System Fault", error, info.componentStack);
  }

  private reboot = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-[var(--background)] px-6 text-center"
      >
        <div className="max-w-lg rounded-xl border border-[var(--danger)] bg-[var(--surface)] p-8 shadow-[var(--shadow-panel)]">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--danger)]">
            // system fault
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            System Fault
          </h1>
          <p className="mt-3 font-mono text-sm text-[var(--muted)]">
            Render pipeline interrupted. Core dump retained for operator review.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left font-mono text-xs text-[var(--danger)]">
            {this.state.message}
          </pre>
          <button
            type="button"
            onClick={this.reboot}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-[var(--primary)] bg-[var(--primary)] px-5 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-[var(--primary-foreground)] transition hover:opacity-90"
          >
            Reboot Server
          </button>
        </div>
      </div>
    );
  }
}
