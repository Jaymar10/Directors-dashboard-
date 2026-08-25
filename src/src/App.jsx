import { useState, useMemo, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  Sparkles,
  Landmark,
  Terminal,
  ClipboardList,
  UserCog,
  ChevronDown,
  Plus,
  X,
  CircleDot,
} from "lucide-react";

// ---- Design tokens -------------------------------------------------------
const COLORS = {
  bg: "#0A0E13",
  surface: "#12181F",
  surface2: "#1A2129",
  border: "#232B35",
  textPrimary: "#E7ECF2",
  textSecondary: "#8391A0",
  textTertiary: "#4E5964",
  signal: "#45D8A0", // active
  amber: "#E3A94A", // standby / planned
  blue: "#6C90F0", // leadership tier
  red: "#E2637A", // blocked
};

// ---- Org data -------------------------------------------------------------
const LEADERSHIP = [
  {
    id: "ceo",
    role: "AI Agent CEO",
    focus: "Strategy, trend forecasting, product direction",
    icon: Sparkles,
    agents: [
      { name: "Trend Scout — Consumer", fn: "Everyday-trend monitoring", status: "active" },
      { name: "Trend Scout — B2B", fn: "Business-need monitoring", status: "active" },
      { name: "Market Analyst", fn: "Sizing & demand validation", status: "standby" },
      { name: "Competitor Scout", fn: "Landscape & pricing scans", status: "standby" },
      { name: "Product Strategist", fn: "Turns trends into product briefs", status: "standby" },
      { name: "Brand Strategist", fn: "Positioning & naming", status: "standby" },
      { name: "Partnerships Agent", fn: "Distribution & co-sell leads", status: "standby" },
      { name: "Growth Strategist", fn: "Channel & funnel planning", status: "standby" },
      { name: "Innovation Lead", fn: "Backlog of new tool ideas", status: "standby" },
    ],
  },
  {
    id: "cfo",
    role: "AI Agent CFO",
    focus: "Budgeting, pricing, subscriptions, reporting",
    icon: Landmark,
    agents: [
      { name: "Bookkeeper", fn: "Transaction logging", status: "standby" },
      { name: "Budget Analyst", fn: "Spend vs. runway tracking", status: "standby" },
      { name: "Pricing Strategist", fn: "Product & tier pricing", status: "standby" },
      { name: "Subscriptions Agent", fn: "Bills & tracks Launch Site subscribers", status: "active" },
      { name: "Invoicing Agent", fn: "Client invoicing", status: "standby" },
      { name: "Financial Reporter", fn: "Monthly P&L summaries", status: "standby" },
      { name: "Cashflow Agent", fn: "Forecasting & alerts", status: "standby" },
      { name: "Tax & Compliance Agent", fn: "Filing prep support", status: "standby" },
      { name: "Vendor Cost Auditor", fn: "Tooling & infra spend", status: "standby" },
    ],
  },
  {
    id: "cto",
    role: "AI Agent CTO",
    focus: "Build, ship, and maintain the products",
    icon: Terminal,
    agents: [
      { name: "Frontend Builder", fn: "Builds & maintains the Launch Site template", status: "active" },
      { name: "Backend Builder", fn: "Hosting, SSL & site deploy pipeline", status: "active" },
      { name: "Full-Stack Builder", fn: "End-to-end feature work", status: "standby" },
      { name: "QA / Tester", fn: "Pre-launch QA checklist per client site", status: "active" },
      { name: "DevOps Agent", fn: "Deploys & infra", status: "standby" },
      { name: "Security Agent", fn: "Audits & hardening", status: "standby" },
      { name: "Data Engineer", fn: "Pipelines & analytics", status: "standby" },
      { name: "AI/ML Engineer", fn: "Model-powered features", status: "standby" },
      { name: "Product Designer", fn: "UX for each tool", status: "standby" },
    ],
  },
  {
    id: "coo",
    role: "AI Agent COO",
    focus: "Delivery, community, marketing, support",
    icon: UserCog,
    agents: [
      { name: "Project Manager", fn: "Cross-team task routing", status: "active" },
      { name: "SOP Recorder", fn: "Logs every procedure step", status: "active" },
      { name: "Support Lead", fn: "Monthly update requests & client support", status: "active" },
      { name: "Community Manager", fn: "Discord server", status: "standby" },
      { name: "Social Media Manager", fn: "Multi-platform posting", status: "standby" },
      { name: "Content Marketer", fn: "Launch content & SEO", status: "standby" },
      { name: "Sales / Outreach Agent", fn: "Inbound & cold outreach", status: "standby" },
      { name: "Vendor & Procurement", fn: "Tooling decisions", status: "standby" },
      { name: "Quality Control Agent", fn: "Cross-checks deliverables", status: "standby" },
    ],
  },
  {
    id: "pa",
    role: "AI Agent PA",
    focus: "Executive support & record-keeping for you",
    icon: ClipboardList,
    agents: [
      { name: "Scheduler", fn: "Calendar & deadlines", status: "standby" },
      { name: "Comms Triage", fn: "Inbox sorting", status: "standby" },
      { name: "Meeting Notetaker", fn: "Decisions & action items", status: "standby" },
      { name: "Document Archivist", fn: "Filing & version control", status: "standby" },
      { name: "Task Tracker", fn: "Personal follow-ups", status: "standby" },
      { name: "Reporting Assistant", fn: "Weekly MD summary", status: "active" },
      { name: "Onboarding Agent", fn: "New-hire agent setup", status: "standby" },
      { name: "Research Assistant", fn: "Ad-hoc lookups for you", status: "standby" },
      { name: "MD Liaison", fn: "Relays your decisions down", status: "standby" },
    ],
  },
];

const PRODUCT_LINE = {
  name: "Startup Launch Site",
  price: "$199/mo",
  pipeline: [
    { stage: "Intake", agent: "Project Manager", dept: "coo" },
    { stage: "Build", agent: "Frontend Builder", dept: "cto" },
    { stage: "QA", agent: "QA / Tester", dept: "cto" },
    { stage: "Deploy", agent: "Backend Builder", dept: "cto" },
    { stage: "Bill", agent: "Subscriptions Agent", dept: "cfo" },
    { stage: "Maintain", agent: "Support Lead", dept: "coo" },
  ],
};

const roleColor = (id) =>
  ({ ceo: COLORS.signal, cfo: COLORS.amber, cto: COLORS.blue, coo: "#B892F0", pa: "#5FC9E8" }[id]);

const seedLog = [
  { id: 1, ts: "2026-08-11 09:14", dept: "cto", agent: "Frontend Builder", task: "Scaffold landing page for Tool #1", status: "Done" },
  { id: 2, ts: "2026-08-11 10:02", dept: "ceo", agent: "Trend Scout — Consumer", task: "Weekly trend scan: productivity tools", status: "Done" },
  { id: 3, ts: "2026-08-12 08:30", dept: "coo", agent: "SOP Recorder", task: "Draft procedure template for product launches", status: "In Progress" },
  { id: 4, ts: "2026-08-13 14:47", dept: "ceo", agent: "Trend Scout — B2B", task: "Interview 5 small biz owners on pain points", status: "Planned" },
  { id: 5, ts: "2026-08-13 16:05", dept: "coo", agent: "Project Manager", task: "Route Tool #1 brief to CTO team", status: "Done" },
  { id: 6, ts: "2026-08-14 07:55", dept: "pa", agent: "Reporting Assistant", task: "Compile weekly MD summary", status: "In Progress" },
];

const statusPill = (status) => {
  const map = {
    active: { color: COLORS.signal, label: "Active" },
    standby: { color: COLORS.textTertiary, label: "Standby" },
    Done: { color: COLORS.signal, label: "Done" },
    "In Progress": { color: COLORS.amber, label: "In Progress" },
    Planned: { color: COLORS.textTertiary, label: "Planned" },
  };
  return map[status] || { color: COLORS.textTertiary, label: status };
};

const LOG_KEY = "ops-command:task-log";
const STATUS_KEY = "ops-command:agent-status";

export default function OpsCommandDashboard() {
  const [view, setView] = useState("structure");
  const [selectedDept, setSelectedDept] = useState("ceo");
  const [logFilter, setLogFilter] = useState("all");
  const [log, setLog] = useState(seedLog);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ dept: "ceo", agent: "", task: "", status: "Planned" });
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("dashboard_state")
          .select("key, value")
          .in("key", [LOG_KEY, STATUS_KEY]);
        if (!error && data) {
          const logRow = data.find((r) => r.key === LOG_KEY);
          const statusRow = data.find((r) => r.key === STATUS_KEY);
          if (logRow) setLog(logRow.value);
          if (statusRow) setStatusOverrides(statusRow.value);
        }
      } catch (e) {
        console.error("Load failed", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  async function persistLog(nextLog) {
    setLog(nextLog);
    try {
      const { error } = await supabase
        .from("dashboard_state")
        .upsert({ key: LOG_KEY, value: nextLog, updated_at: new Date().toISOString() });
      setSaveError(!!error);
    } catch {
      setSaveError(true);
    }
  }

  async function persistStatus(nextOverrides) {
    setStatusOverrides(nextOverrides);
    try {
      const { error } = await supabase
        .from("dashboard_state")
        .upsert({ key: STATUS_KEY, value: nextOverrides, updated_at: new Date().toISOString() });
      setSaveError(!!error);
    } catch {
      setSaveError(true);
    }
  }

  function getStatus(deptId, agent) {
    const key = `${deptId}::${agent.name}`;
    return statusOverrides[key] || agent.status;
  }

  function toggleStatus(deptId, agent) {
    const key = `${deptId}::${agent.name}`;
    const current = getStatus(deptId, agent);
    const next = current === "active" ? "standby" : "active";
    persistStatus({ ...statusOverrides, [key]: next });
  }

  const activeCount = useMemo(
    () => LEADERSHIP.reduce((n, d) => n + d.agents.filter((a) => getStatus(d.id, a) === "active").length, 0),
    [statusOverrides]
  );
  const totalAgents = LEADERSHIP.length + LEADERSHIP.reduce((n, d) => n + d.agents.length, 0);

  const filteredLog = logFilter === "all" ? log : log.filter((l) => l.dept === logFilter);
  const currentDept = LEADERSHIP.find((d) => d.id === selectedDept);
  const agentOptions = LEADERSHIP.find((d) => d.id === form.dept)?.agents || [];

  function submitTask(e) {
    e.preventDefault();
    if (!form.agent || !form.task.trim()) return;
    const now = new Date();
    const ts = now.toISOString().slice(0, 16).replace("T", " ");
    persistLog([{ id: Date.now(), ts, dept: form.dept, agent: form.agent, task: form.task.trim(), status: form.status }, ...log]);
    setForm({ dept: form.dept, agent: "", task: "", status: "Planned" });
    setFormOpen(false);
  }

  if (!loaded) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: COLORS.bg, color: COLORS.textTertiary, fontFamily: "Inter, sans-serif" }}
      >
        <span className="mono text-xs">Loading command state…</span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: COLORS.bg, color: COLORS.textPrimary, fontFamily: "Inter, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .mono { font-family: 'JetBrains Mono', monospace; }
        .display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="border-b px-6 py-5 md:px-10" style={{ borderColor: COLORS.border }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mono text-xs tracking-widest" style={{ color: COLORS.textTertiary }}>
              AI-RUN VENTURE STUDIO
            </div>
            <div className="display text-2xl md:text-3xl font-bold mt-1">Ops//Command</div>
            <div className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
              {totalAgents} agents provisioned · {activeCount} active · 3-year target: 7 figures
            </div>
            <div className="mono text-xs mt-2" style={{ color: COLORS.signal }}>
              ACTIVE LINE — {PRODUCT_LINE.name} · {PRODUCT_LINE.price}
            </div>
            {saveError && (
              <div className="mono text-[10px] mt-1" style={{ color: COLORS.red }}>
                Last change didn't save — check connection and retry
              </div>
            )}
          </div>

          <div className="flex gap-2 rounded-lg p-1" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            {[
              { id: "structure", label: "Org Structure" },
              { id: "log", label: "Procedure Log" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={
                  view === t.id
                    ? { background: COLORS.surface2, color: COLORS.textPrimary }
                    : { color: COLORS.textSecondary }
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 max-w-md">
          <div className="flex justify-between mono text-[11px] mb-1" style={{ color: COLORS.textTertiary }}>
            <span>YEAR 1 OF 3</span>
            <span>$0 / 7-figure target</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: COLORS.surface2 }}>
            <div className="h-full rounded-full" style={{ width: "2%", background: COLORS.signal }} />
          </div>
        </div>
      </div>

      {view === "structure" ? (
        <div className="px-6 py-10 md:px-10">
          {/* Product pipeline strip */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="mono text-[10px] tracking-widest mb-2 text-center" style={{ color: COLORS.textTertiary }}>
              {PRODUCT_LINE.name.toUpperCase()} — PRODUCTION PIPELINE
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PRODUCT_LINE.pipeline.map((step, i) => (
                <div key={step.stage} className="flex items-center gap-2">
                  <div
                    className="rounded-lg px-3 py-2 text-center"
                    style={{ background: COLORS.surface, border: `1px solid ${roleColor(step.dept)}` }}
                  >
                    <div className="text-xs font-medium">{step.stage}</div>
                    <div className="mono text-[10px] mt-0.5" style={{ color: COLORS.textSecondary }}>
                      {step.agent}
                    </div>
                  </div>
                  {i < PRODUCT_LINE.pipeline.length - 1 && (
                    <span className="mono text-xs" style={{ color: COLORS.textTertiary }}>
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Managing Director node */}
          <div className="flex justify-center">
            <div
              className="rounded-xl px-5 py-3 text-center"
              style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <div className="mono text-[11px]" style={{ color: COLORS.textTertiary }}>
                HUMAN — MANAGING DIRECTOR
              </div>
              <div className="display font-semibold mt-0.5">You</div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-px h-8" style={{ background: COLORS.border }} />
          </div>

          {/* Leadership row */}
          <div className="border-t pt-8" style={{ borderColor: COLORS.border }}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {LEADERSHIP.map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDept === dept.id;
                const activeN = dept.agents.filter((a) => getStatus(dept.id, a) === "active").length;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(isSelected ? null : dept.id)}
                    className="relative text-left rounded-lg p-4 transition-transform hover:-translate-y-0.5"
                    style={{
                      background: COLORS.surface,
                      border: `1px solid ${isSelected ? roleColor(dept.id) : COLORS.border}`,
                    }}
                  >
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4"
                      style={{ background: COLORS.border }}
                    />
                    <Icon size={16} style={{ color: roleColor(dept.id) }} />
                    <div className="display text-sm font-semibold mt-2">{dept.role}</div>
                    <div className="text-xs mt-1 leading-snug" style={{ color: COLORS.textSecondary }}>
                      {dept.focus}
                    </div>
                    <div className="mono text-[10px] mt-3" style={{ color: COLORS.textTertiary }}>
                      {activeN}/{dept.agents.length} ACTIVE
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded department agents */}
          {currentDept && (
            <div className="max-w-5xl mx-auto mt-8 border-t pt-6" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center gap-2 mb-4">
                <ChevronDown size={14} style={{ color: roleColor(currentDept.id) }} />
                <span className="mono text-xs tracking-wide" style={{ color: COLORS.textSecondary }}>
                  REPORTS TO {currentDept.role.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentDept.agents.map((a) => {
                  const status = getStatus(currentDept.id, a);
                  const pill = statusPill(status);
                  return (
                    <div
                      key={a.name}
                      className="rounded-lg p-3 flex items-start justify-between gap-2"
                      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
                    >
                      <div>
                        <div className="text-sm font-medium">{a.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
                          {a.fn}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStatus(currentDept.id, a)}
                        className="flex items-center gap-1 shrink-0 mt-0.5"
                        title="Click to toggle status"
                      >
                        <CircleDot size={10} style={{ color: pill.color }} />
                        <span className="mono text-[10px]" style={{ color: pill.color }}>
                          {pill.label}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="px-6 py-8 md:px-10">
          {/* Filters + new entry */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLogFilter("all")}
                className="mono text-[11px] px-3 py-1.5 rounded-full"
                style={
                  logFilter === "al