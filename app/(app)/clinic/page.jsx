'use client';
import { useState } from 'react';
import { useApp, nm, stock, entry, today } from '@/lib/store';
import EditModal from '@/components/EditModal';

const TRIAGE = ['Green (mild)', 'Yellow (urgent)', 'Red (emergency)'];
const tri = (t) => (t[0] === 'R' ? 'b' : t[0] === 'Y' ? 'w' : 'ok');
const BLANK = { p: '', t: TRIAGE[0], dx: '', rx: '', tmp: '', wt: '', g: '', q: 0, fu: '' };

export default function Clinic() {
  const { S, update } = useApp();
  const drugs = S.inv.filter((i) => i.d);
  const [f, setF] = useState(BLANK), [err, setErr] = useState(''), [edit, setEdit] = useState(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const p = f.p || S.ben[0]?.id || '';
  const due = S.clin.filter((c) => c.fu && !c.done).sort((a, b) => (a.fu > b.fu ? 1 : -1));

  const save = () => {
    const q = +f.q || 0;
    if (!f.dx.trim()) { setErr('Enter a diagnosis.'); return; }
    if (f.g && stock(S, f.g).q < q) { setErr(`Not enough ${f.g} in stock.`); return; }
    setErr('');
    const rec = { id: Date.now(), p, t: f.t, dx: f.dx.trim(), rx: f.rx.trim(), dg: f.g, dq: q, fu: f.fu, tmp: f.tmp, wt: f.wt, date: today() };
    update((n) => {
      n.clin.push(rec);
      if (rec.dg) { stock(n, rec.dg).q -= q; n.log.push(entry(rec.dg, 'Clinic: ' + nm(n, p), -q)); } // drug stock auto-deducts
    });
    setF({ ...BLANK, t: f.t });
  };

  return (
    <>
      <div className="card">
        <label>Patient</label>
        <select value={p} onChange={(e) => set('p', e.target.value)}>{S.ben.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.id})</option>)}</select>
        <label>Triage</label>
        <select value={f.t} onChange={(e) => set('t', e.target.value)}>{TRIAGE.map((t) => <option key={t}>{t}</option>)}</select>
        <label>Diagnosis</label><input value={f.dx} onChange={(e) => set('dx', e.target.value)} />
        <label>Treatment</label><input value={f.rx} onChange={(e) => set('rx', e.target.value)} />
        <div className="g2">
          <div><label>Temp (°C)</label><input type="number" step="0.1" value={f.tmp} onChange={(e) => set('tmp', e.target.value)} /></div>
          <div><label>Weight (kg)</label><input type="number" step="0.1" value={f.wt} onChange={(e) => set('wt', e.target.value)} /></div>
        </div>
        <label>Drug given</label>
        <select value={f.g} onChange={(e) => set('g', e.target.value)}><option value="">None</option>{drugs.map((d) => <option key={d.n}>{d.n}</option>)}</select>
        <label>Drug quantity</label><input type="number" min="0" value={f.q} onChange={(e) => set('q', e.target.value)} />
        <label>Follow-up date</label><input type="date" value={f.fu} onChange={(e) => set('fu', e.target.value)} />
        <div className="err">{err}</div>
        <button className="btn" onClick={save}>Save visit</button>
      </div>

      {due.length > 0 && (
        <div className="card">
          <h3>Follow-ups due</h3>
          {due.map((c) => (
            <div className="it" key={c.id}>
              <div><b>{nm(S, c.p)}</b><div className="m">{c.fu}{c.fu < today() ? ' · overdue' : ''}</div></div>
              <button className="btn s" onClick={() => update((n) => { n.clin.find((z) => z.id === c.id).done = 1; })}>Mark seen</button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3>Visits</h3>
        {S.clin.length === 0 && <p className="m">No visits yet.</p>}
        {S.clin.slice().reverse().map((c) => (
          <div className="it" key={c.id}>
            <div>
              <b>{nm(S, c.p)}</b>
              <div className="m">{c.dx} · {c.rx}{c.dg ? ` · ${c.dq} ${c.dg}` : ''}{c.tmp ? ` · ${c.tmp}°C` : ''}{c.wt ? ` · ${c.wt} kg` : ''}</div>
              <div className="m">{c.date}{c.fu ? ` · follow-up ${c.fu}` : ''}</div>
            </div>
            <span className={'tag ' + tri(c.t)}>{c.t.split(' ')[0]}</span>
            <button className="btn s g" onClick={() => setEdit(c)}>Edit</button>
          </div>
        ))}
      </div>

      {edit && (
        <EditModal
          title="Edit visit"
          fields={[
            { k: 't', l: 'Triage', v: edit.t, o: TRIAGE }, { k: 'dx', l: 'Diagnosis', v: edit.dx }, { k: 'rx', l: 'Treatment', v: edit.rx },
            { k: 'fu', l: 'Follow-up date', t: 'date', v: edit.fu }, { k: 'tmp', l: 'Temp (°C)', t: 'number', v: edit.tmp || '' },
            { k: 'wt', l: 'Weight (kg)', t: 'number', v: edit.wt || '' },
          ]}
          onSave={(v) => update((n) => {
            const c = n.clin.find((z) => z.id === edit.id);
            if (v.fu && v.fu !== c.fu) c.done = 0; // new follow-up date puts it back on the due list
            Object.assign(c, v);
          })}
          onDelete={() => update((n) => {
            const c = n.clin.find((z) => z.id === edit.id);
            if (c.dg) stock(n, c.dg).q += c.dq; // give the drug back to stock
            n.clin = n.clin.filter((z) => z.id !== edit.id);
          })}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
