import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiveCursors } from "@/components/LiveCursors";

const publishCursor = vi.fn();

vi.mock("@/components/WarRoomChannelProvider", () => ({
  useWarRoomChannel: () => ({
    remoteCursors: {
      "remote-op": { x: 120, y: 80 },
    },
    publishCursor,
    me: { id: "local-user", anon: true, claims: {} },
  }),
}));

describe("LiveCursors", () => {
  it("renders remote cursor markers at mocked coordinates", () => {
    render(
      <LiveCursors>
        <div>canvas</div>
      </LiveCursors>,
    );

    const cursor = screen.getByTestId("cursor-remote-op");
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveAttribute("data-x", "120");
    expect(cursor).toHaveAttribute("data-y", "80");
    expect(cursor).toHaveStyle({ left: "120px", top: "80px" });
    expect(screen.getByText("remote-op")).toBeInTheDocument();
  });

  it("publishes cursor position on pointer move", () => {
    render(
      <LiveCursors>
        <div>canvas</div>
      </LiveCursors>,
    );

    fireEvent.pointerMove(screen.getByText("canvas").parentElement!, {
      clientX: 40,
      clientY: 60,
    });

    expect(publishCursor).toHaveBeenCalled();
    expect(screen.getByTestId("cursor-you")).toBeInTheDocument();
  });
});
