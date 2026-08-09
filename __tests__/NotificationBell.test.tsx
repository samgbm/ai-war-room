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
        title: "Scout mentioned you",
        data: {},
        at: Date.now(),
        read: false,
        markAsRead: markAsReadOne,
      },
      {
        id: "n-2",
        type: "ticket.assigned",
        title: "Ticket assigned: Alpha desk",
        data: {},
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
  it("shows the unread badge and renders mock titles in the dropdown", () => {
    render(<NotificationBell />);

    expect(screen.getByTestId("notification-badge")).toHaveTextContent("2");

    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));

    expect(screen.getByText("Scout mentioned you")).toBeInTheDocument();
    expect(screen.getByText("Ticket assigned: Alpha desk")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark all as read/i }),
    ).toBeInTheDocument();
  });
});
