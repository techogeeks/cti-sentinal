import { useEffect, useState } from "react";
import { api } from "./api.js";

const VERDICT_COLORS = { Malicious: "var(--bad)", Suspicious: "var(--warn)", Benign: "var(--good)" };
const SEV_COLORS = { Critical: "var(--crit)", High: "var(--high)", Medium: "var(--med)", Low: "var(--low)" };

function Bars({ rows, colors, onPick }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="bars">
      {rows.map((r) => (
        <button key={r.name} className="bar-row" onClick={() => onPick(r.name)} title={`Show ${r.name} threats`}>
          <span className="bar-name">{r.name}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${(r.n / max) * 100}%`, background: colors?.[r.name] || "var(--accent)" }} />
          </span>
          <span className="bar-n">{r.n}</span>
        </button>
      ))}
    </div>
  );
}

export default function Dashboard({ onOpen }) {
  const [s, setS] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/stats").then(setS).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!s) return <p className="muted">Loading overview…</p>;
  if (s.total === 0)
    return (
      <div className="empty">
        <h2>No threats yet</h2>
        <p>Load the demo data with <code>python -m scripts.seed</code>, then reload this page.</p>
      </div>
    );

  const verdictRows = ["Malicious", "Suspicious", "Benign"].map((n) => ({ name: n, n: s.verdicts[n] || 0 }));
  const sevRows = ["Critical", "High", "Medium", "Low"].map((n) => ({ name: n, n: s.severities[n] || 0 }));

  return (
    <div className="stack">
      <section className="lead">
        <div>
          <h1>{s.awaitingReview} of {s.total} threats are waiting for an analyst verdict</h1>
          <p className="muted">Verdicts start as automatic suggestions. Review a threat to confirm or change its classification.</p>
        </div>
        <button className="primary" onClick={() => onOpen({ reviewed: "false" })}>Review unreviewed threats</button>
      </section>

      <section className="verdict-strip" aria-label="Verdict split">
        {verdictRows.map((r) => (
          <button key={r.name} style={{ flex: Math.max(r.n, 1), background: VERDICT_COLORS[r.name] }} onClick={() => onOpen({ verdict: r.name })}>
            <strong>{r.n}</strong> {r.name}
          </button>
        ))}
      </section>

      <div className="grid2">
        <section className="panel">
          <h3>By severity</h3>
          <Bars rows={sevRows} colors={SEV_COLORS} onPick={(v) => onOpen({ severity: v })} />
        </section>
        <section className="panel">
          <h3>Top categories</h3>
          <Bars rows={s.categories} onPick={(v) => onOpen({ category: v })} />
        </section>
      </div>

      <section className="panel">
        <h3>Busiest sources</h3>
        <table className="table">
          <thead><tr><th>Source</th><th>Threats</th><th>Reliability</th></tr></thead>
          <tbody>
            {s.sources.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.n}</td>
                <td><span className="meter"><span style={{ width: `${r.reliability}%` }} /></span> {r.reliability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
