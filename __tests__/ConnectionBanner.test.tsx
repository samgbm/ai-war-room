import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectionBanner } from "@/components/ConnectionBanner";

describe("ConnectionBanner", () => {
  it("renders the reconnecting warning", () => {
    render(<ConnectionBanner status="reconnecting" />);

    expect(
      screen.getByText(
        "Network anomaly detected. Reestablishing secure link...",
      ),
    ).toBeInTheDocument();
  });

  it("renders the degraded warning", () => {
    render(<ConnectionBanner status="degraded" />);

    expect(
      screen.getByText(
        "WebSocket degraded. Falling back to HTTP polling. Expect higher latency.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the blocked error", () => {
    render(<ConnectionBanner status="blocked" />);

    expect(
      screen.getByText(
        "Connection Blocked: Invalid Credentials or Rate Limit Exceeded.",
      ),
    ).toBeInTheDocument();
  });
});
