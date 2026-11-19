import AIChat from "./AIChat.jsx";
import Assignments from "./Assignments.jsx";
import { useCallback, useState } from "react";
import Dashboard from "./Dashboard.jsx";
import Threats from "./Threats.jsx";
import Lab71 from "./Lab71.jsx";
import Lab72 from "./Lab72.jsx";

const TABS = [
  ["overview", "Overview"],
  ["threats", "Threats"],
  ["lab71", "Lab 7.1 Schema"],
  ["lab72", "Lab 7.2 Working set"],
  ["assignments", "All Assignments"],
  ["ai", "NVIDIA Chat"],
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [preset, setPreset] = useState({ key: 0, filters: {} });
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, kind = "ok") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Clicking a chart on the overview jumps to the threat list with that filter applied.
  const openThreats = (filters) => {
    setPreset((p) => ({ key: p.key + 1, filters }));
    setTab("threats");
  };

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">CTI Sentinel</div>
        <nav>
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? "tab on" : "tab"} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab === "overview" && <Dashboard onOpen={openThreats} notify={notify} />}
        {tab === "threats" && <Threats key={preset.key} preset={preset.filters} notify={notify} />}
        {tab === "lab71" && <Lab71 notify={notify} />}
        {tab === "lab72" && <Lab72 notify={notify} />}
        {tab === "assignments" && <Assignments />}
        {tab === "ai" && <AIChat />}
      </main>
      {toast && <div className={"toast " + toast.kind} role="status">{toast.message}</div>}
    </div>
  );
}
