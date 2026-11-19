import { useEffect, useState } from "react";
import { api } from "./api.js";

const descriptions = {
  "10-1": "ACID bank transfer: successful commit and rejected transfer rollback",
  "10-2": "Concurrent inventory reservations: 10 requests for 5 items",
  "11-1": "Evaluate candidate shard keys using an illustrative decision matrix",
  "11-2": "Generate 10,000 records and simulate hashed shard distribution",
  "12-1": "Inspect authenticated MongoDB user/roles; setup is manual and isolated",
  "12-2": "Test TLS connection after configuring an isolated TLS MongoDB instance",
};
const runnable = new Set(Object.keys(descriptions));

export default function Assignments() {
  const [replica, setReplica] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [running, setRunning] = useState("");
  const [results, setResults] = useState({});

  useEffect(() => {
    api("/assignments").then(d => setItems(d.assignments)).catch(e => setError(e.message));
  }, []);

  async function run(a) {
    const key = `${a.chapter}-${a.lab}`;
    setRunning(key);
    setResults(old => ({...old, [key]: null}));
    try {
      const data = await api(`/labs/${a.chapter}/${a.lab}/run`, {method:"POST"});
      setResults(old => ({...old, [key]: {data}}));
    } catch (e) {
      setResults(old => ({...old, [key]: {error:e.message}}));
    } finally {
      setRunning("");
    }
  }

  return <section style={{padding:24}}>
    <h1>MongoDB Lab Assignments</h1>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
      <button onClick={async()=>{try{setReplica(await api("/labs/replica/status"))}catch(e){setReplica({error:e.message})}}}>Check replica set (Labs 8–9)</button>
      <button onClick={async()=>{try{setMetrics(await api("/labs/14/1/metrics"))}catch(e){setMetrics({error:e.message})}}}>Read monitoring metrics (Lab 14.1)</button>
      <button onClick={async()=>{if(!window.confirm("Run 6,000 real writes against your isolated 3-node replica set?"))return;try{setBenchmark(await api("/labs/9/1/benchmark",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({confirm:"isolated-lab"})}))}catch(e){setBenchmark({error:e.message})}}}>Run write benchmark (Lab 9.1)</button>
    </div>
    {replica&&<pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(replica,null,2)}</pre>}
    {metrics&&<pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(metrics,null,2)}</pre>}
    {benchmark&&<pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(benchmark,null,2)}</pre>}
    <p>18 chapters / 36 labs. Chapters 10–11 use generated data; Chapter 12 requires isolated security setup.</p>
    <p>For local execution, set <code>ENABLE_LAB_RUNNER=1</code> in your backend <code>.env</code>. Lab 10 requires a replica set.</p>
    {error && <p role="alert">{error}</p>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:12}}>
      {items.map(a => {
        const key = `${a.chapter}-${a.lab}`;
        const output = results[key];
        return <article key={key} style={{border:"1px solid #7775",borderRadius:10,padding:16}}>
          <h3>{a.title}</h3>
          {descriptions[key] && <p>{descriptions[key]}</p>}
          <p>Source: {a.status === "source-present" ? "available" : "not included"}</p>
          <p>Integration: {a.execution === "existing-ui" ? "Existing CTI lab tab" : a.execution === "interactive-local" ? "Local runner" : a.execution === "guided-security" ? "Read-only check + manual setup" : "Not yet connected"}</p>
          {a.files.map(f => <code key={f} style={{display:"block",overflowWrap:"anywhere",fontSize:12}}>{f}</code>)}
          {runnable.has(key) && <button type="button" disabled={!!running} onClick={() => run(a)} style={{marginTop:12,padding:"8px 12px",cursor:"pointer"}}>
            {running === key ? "Running…" : a.chapter === 12 ? "Check setup" : "Run experiment"}
          </button>}
          {output?.error && <p role="alert" style={{color:"#d97777"}}>{output.error}</p>}
          {output?.data && <div style={{marginTop:12}}>
            <strong>{output.data.passed === true ? "Check passed" : output.data.passed === false ? "Check failed" : "Setup information"}</strong>
            <pre style={{maxHeight:320,overflow:"auto",whiteSpace:"pre-wrap",overflowWrap:"anywhere",fontSize:12}}>{JSON.stringify(output.data,null,2)}</pre>
          </div>}
        </article>;
      })}
    </div>
  </section>;
}
