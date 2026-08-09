import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationBell } from "@/components/NotificationBell";

const markAsReadOne = vi.fn();
const markAsReadTwo = vi.fn();
const markAllRead = vi.fn();

vi.mock("@portalsdk/react", () => ({
  useInbox: () => ({
    counter: 2,
    items: [
      {
        id: "n-1",
        type: "mention",
        title: "Agent Tagged You",
        data: { text: "Here is a story about a space station orbiting Mars." },
        at: Date.now(),
        read: false,
        markAsRead: markAsReadOne,
      },
      {
        id: "n-2",
        type: "ticket.assigned",
        title: "Ticket assigned: Alpha desk",
        data: { text: "Short note" },
        at: Date.now(),
        read: false,
        markAsRead: markAsReadTwo,
      },
    ],
    markAllRead,
    unseen: 2,
    channels: {},
    status: "ready",
  }),
}));

describe("NotificationBell", () => {
  it("shows the unread badge and renders title plus text snippet", () => {
    render(<NotificationBell />);

    expect(screen.getByTestId("notification-badge")).toHaveTextContent("2");

    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));

    expect(
      screen.getByText(
        "Agent Tagged You: Here is a story about a space ...",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ticket assigned: Alpha desk: Short note..."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark all as read/i }),
    ).toBeInTheDocument();
  });
});
