'use client';
import { useState } from 'react';
import { useApp, mon } from '@/lib/store';

export default function Report() {
  const { S } = useApp();
  const [m, setM] = useState(mon()), [copied, setCopied] = useState(false);

  const d = S.dist.filter((x) => x.s === 'Distributed' && x.date.slice(0, 7) === m);
  const c = S.clin.filter((x) => x.date.slice(0, 7) === m);
  const served = [...new Set(d.map((x) => x.b))];
  const ben = (id) => S.ben.find((b) => b.id === id) || {};
  const sum = (k) => d.filter((x) => x.k === k).reduce((a, x) => a + x.q, 0);
  const vil = {};
  d.forEach((x) => { const v = ben(x.b).village; vil[v] = (vil[v] || 0) + 1; });
  const r = {
    hh: served.length,
    ppl: served.reduce((a, id) => a + (ben(id).fam || 0), 0),
    vul: served.filter((id) => (ben(id).tag || 'None') !== 'None').length,
    food: sum('Food Kit'), wash: sum('Wash Kit'), shel: sum('Shelter Kit'), tx: c.length,
  };
  const txt = `SAMARITAN DONOR REPORT — ${m}
Households served: ${r.hh} (${r.vul} vulnerable)
People reached: ${r.ppl}
Food distributed: ${r.food} kg
Wash kits: ${r.wash}
Shelter kits: ${r.shel}
Medical treatments: ${r.tx}
By village: ${Object.entries(vil).map(([v, n]) => `${v} (${n} distributions)`).join('; ') || 'none'}`;

  return (
    <>
      <label>Month</label>
      <input type="month" value={m} onChange={(e) => e.target.value && setM(e.target.value)} />
      <div className="g2">
        <div className="card"><div className="big">{r.ppl}</div>people served ({r.hh} households, {r.vul} vulnerable)</div>
        <div className="card"><div className="big">{r.food} kg</div>food distributed</div>
        <div className="card"><div className="big">{r.tx}</div>treatments this month</div>
        <div className="card"><div className="big">{r.wash + r.shel}</div>wash and shelter kits</div>
      </div>
      <div className="card">
        <h3>By village</h3>
        {Object.keys(vil).length === 0 && <p className="m">No distributions this month.</p>}
        {Object.entries(vil).map(([v, n]) => <div className="it" key={v}><div>{v}</div><b>{n}</b></div>)}
      </div>
      <button className="btn" onClick={() => navigator.clipboard.writeText(txt).then(() => setCopied(true), () => alert(txt))}>
        {copied ? 'Copied' : 'Copy report to send'}
      </button>
    </>
  );
}
