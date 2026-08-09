export type AgentStatus = "idle" | "running" | "blocked" | "offline";

export type MissionPriority = "P0" | "P1" | "P2" | "P3";

export interface WarRoom {
  id: string;
  channelId: string;
  name: string;
  codename: string;
  priority: MissionPriority;
  summary: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  focus: string;
  latencyMs: number;
  successRate: number;
}

export interface MockMessage {
  id: string;
  roomId: string;
  sender: string;
  role: "operator" | "agent" | "system";
  body: string;
  at: string;
}

export interface Objective {
  id: string;
  label: string;
  progress: number;
  owner: string;
}

export const WAR_ROOMS: WarRoom[] = [
  {
    id: "alpha",
    channelId: "war-room-alpha",
    name: "Alpha Strike",
    codename: "NIGHTFALL",
    priority: "P0",
    summary: "Coordinate launch-critical agents and unblock shipping gates.",
    updatedAt: "2m ago",
  },
  {
    id: "bravo",
    channelId: "war-room-bravo",
    name: "Bravo Watch",
    codename: "SENTINEL",
    priority: "P1",
    summary: "Monitor production signals and triage anomaly clusters.",
    updatedAt: "6m ago",
  },
  {
    id: "charlie",
    channelId: "war-room-charlie",
    name: "Charlie Research",
    codename: "ORACLE",
    priority: "P2",
    summary: "Synthesize competitor intel and draft response options.",
    updatedAt: "14m ago",
  },
  {
    id: "delta",
    channelId: "war-room-delta",
    name: "Delta Support",
    codename: "LIFELINE",
    priority: "P1",
    summary: "Customer-impact desk — escalate SEV tickets to agents.",
    updatedAt: "9m ago",
  },
];

export const AGENTS: Agent[] = [
  {
    id: "scout",
    name: "Scout",
    role: "Recon",
    status: "running",
    focus: "Scanning incident channels",
    latencyMs: 420,
    successRate: 0.94,
  },
  {
    id: "analyst",
    name: "Analyst",
    role: "Intel",
    status: "running",
    focus: "Correlating error budgets",
    latencyMs: 680,
    successRate: 0.91,
  },
  {
    id: "writer",
    name: "Writer",
    role: "Comms",
    status: "idle",
    focus: "Standing by for brief",
    latencyMs: 310,
    successRate: 0.97,
  },
  {
    id: "fixer",
    name: "Fixer",
    role: "Remediation",
    status: "blocked",
    focus: "Waiting on deploy approval",
    latencyMs: 890,
    successRate: 0.88,
  },
  {
    id: "sentinel",
    name: "Sentinel",
    role: "Guard",
    status: "running",
    focus: "Watching auth anomalies",
    latencyMs: 250,
    successRate: 0.99,
  },
  {
    id: "courier",
    name: "Courier",
    role: "Dispatch",
    status: "offline",
    focus: "Node restart pending",
    latencyMs: 0,
    successRate: 0.9,
  },
];

export const OBJECTIVES: Objective[] = [
  {
    id: "obj-1",
    label: "Stabilize checkout error rate < 0.5%",
    progress: 72,
    owner: "Analyst",
  },
  {
    id: "obj-2",
    label: "Draft launch war-room briefing",
    progress: 45,
    owner: "Writer",
  },
  {
    id: "obj-3",
    label: "Clear P0 backlog before 09:00 UTC",
    progress: 61,
    owner: "Fixer",
  },
  {
    id: "obj-4",
    label: "Confirm failover drill complete",
    progress: 88,
    owner: "Sentinel",
  },
];

export const MOCK_MESSAGES: MockMessage[] = [
  {
    id: "m1",
    roomId: "alpha",
    sender: "System",
    role: "system",
    body: "War room Alpha is live. Portal channel war-room-alpha connected.",
    at: "08:41",
  },
  {
    id: "m2",
    roomId: "alpha",
    sender: "Maya Chen",
    role: "operator",
    body: "Scout, pull the last 15 minutes of checkout 5xx and summarize blast radius.",
    at: "08:42",
  },
  {
    id: "m3",
    roomId: "alpha",
    sender: "Scout",
    role: "agent",
    body: "Spike localized to us-east-1 edge. 412 impacted sessions. CDN cache miss ratio up 18%.",
    at: "08:43",
  },
  {
    id: "m4",
    roomId: "alpha",
    sender: "Noah Park",
    role: "operator",
    body: "Analyst — correlate with the deploy window from 08:20. Writer stand by for status page draft.",
    at: "08:44",
  },
  {
    id: "m5",
    roomId: "alpha",
    sender: "Analyst",
    role: "agent",
    body: "Strong correlation with canary batch #4821. Recommend freeze + rollback of edge config.",
    at: "08:45",
  },
  {
    id: "m6",
    roomId: "bravo",
    sender: "System",
    role: "system",
    body: "Bravo Watch opened. Anomaly score threshold set to 0.82.",
    at: "08:30",
  },
  {
    id: "m7",
    roomId: "bravo",
    sender: "Sentinel",
    role: "agent",
    body: "Auth failure cluster is decaying. No active SEV.",
    at: "08:38",
  },
  {
    id: "m8",
    roomId: "charlie",
    sender: "Priya Nair",
    role: "operator",
    body: "Oracle desk — compare competitor launch notes vs our messaging.",
    at: "08:20",
  },
  {
    id: "m9",
    roomId: "delta",
    sender: "Support Lead",
    role: "operator",
    body: "Three VIP tickets waiting on remediation ETA.",
    at: "08:35",
  },
];

export const OPS_STATS = [
  { label: "Active rooms", value: "4" },
  { label: "Agents online", value: "4/6" },
  { label: "Open P0", value: "1" },
  { label: "Avg latency", value: "510ms" },
] as const;

export function displayNameFromId(id: string | undefined): string {
  if (!id) return "Unknown";
  if (id.startsWith("anon_")) return `Operator ${id.slice(-4).toUpperCase()}`;
  return id;
}
