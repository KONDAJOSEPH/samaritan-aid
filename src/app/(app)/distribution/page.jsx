'use client';
import { useState } from 'react';
import { useApp, nm, stock, entry, today, mon } from '@/lib/store';
import EditModal from '@/components/EditModal';
import QrScanner from '@/components/QrScanner';

const STATUS = { Distributed: 'ok', Returned: 'b', Pending: 'w' };

export default function Distribution() {
  const { S, update } = useApp();
  const kits = S.inv.filter((i) => !i.d);
  const [f, setF] = useState({ b: '', k: '', q: 1, s: 'Distributed', note: '' });
  const [err, setErr] = useState(''), [scan, setScan] = useState(false), [edit, setEdit] = useState(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const b = f.b || S.ben[0]?.id || '', k = f.k || kits[0]?.n || '', unit = stock(S, k)?.u || '';

  const save = () => {
    const q = +f.q, it = stock(S, k);
    if (!b || !it || !(q > 0)) { setErr('Choose a person, a kit and a quantity.'); return; }
    // Prevents double collection: same person + same kit in the same month (unless returned).
    if (S.dist.some((d) => d.b === b && d.k === k && d.s !== 'Returned' && d.date.slice(0, 7) === mon())) {
      setErr(`Blocked: ${nm(S, b)} already collected ${k} this month.`); return;
    }
    if (f.s === 'Distributed' && it.q < q) { setErr('Not enough stock.'); return; }
    setErr('');
    const rec = { id: Date.now(), b, k, q, u: it.u, s: f.s, date: today(), note: f.note.trim() };
    update((n) => {
      n.dist.push(rec);
      if (rec.s === 'Distributed') { stock(n, k).q -= q; n.log.push(entry(k, 'Distributed to ' + nm(n, b), -q)); }
    });
    setF({ ...f, q: 1, note: '' });
  };

  const setStatus = (d, s) => {
    if (s === 'Distributed' && stock(S, d.k).q < d.q) { alert('Not enough stock.'); return; }
    update((n) => {
      const x = n.dist.find((z) => z.id === d.id), i = stock(n, x.k);
      if (s === 'Distributed') { i.q -= x.q; n.log.push(entry(x.k, 'Distributed to ' + nm(n, x.b), -x.q)); }
      else { i.q += x.q; n.log.push(entry(x.k, 'Returned from ' + nm(n, x.b), x.q)); }
      x.s = s;
    });
  };

  return (
    <>
      <div className="card">
        <label>Beneficiary</label>
        <select value={b} onChange={(e) => set('b', e.target.value)}>{S.ben.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.id})</option>)}</select>
        <button className="btn g" style={{ marginBottom: 12 }} onClick={() => setScan(true)}>Scan QR card</button>
        <label>Aid kit</label>
        <select value={k} onChange={(e) => set('k', e.target.value)}>{kits.map((x) => <option key={x.n}>{x.n}</option>)}</select>
        <label>Quantity ({unit})</label><input type="number" min="1" value={f.q} onChange={(e) => set('q', e.target.value)} />
        <label>Status</label>
        <select value={f.s} onChange={(e) => set('s', e.target.value)}><option>Distributed</option><option>Pending</option></select>
        <label>Notes (e.g. collected by proxy)</label><input value={f.note} onChange={(e) => set('note', e.target.value)} />
        <div className="err">{err}</div>
        <button className="btn" onClick={save}>Save distribution</button>
      </div>

      <div className="card">
        <h3>Records</h3>
        {S.dist.length === 0 && <p className="m">No distributions yet.</p>}
        {S.dist.slice().reverse().map((d) => (
          <div className="it" key={d.id}>
            <div><b>{nm(S, d.b)}</b><div className="m">{d.k} · {d.q} {d.u} · {d.date}{d.note ? ` · ${d.note}` : ''}</div></div>
            <span className={'tag ' + STATUS[d.s]}>{d.s}</span>
            <button className="btn s g" onClick={() => setEdit(d)}>Edit</button>
            {d.s === 'Pending' && <button className="btn s" onClick={() => setStatus(d, 'Distributed')}>Done</button>}
            {d.s === 'Distributed' && <button className="btn s g" onClick={() => setStatus(d, 'Returned')}>Return</button>}
          </div>
        ))}
      </div>

      {scan && <QrScanner onClose={() => setScan(false)} onResult={(v) => {
        setScan(false);
        const x = S.ben.find((z) => z.id === v.toUpperCase());
        x ? set('b', x.id) : alert('Card ID not found.');
      }} />}
      {edit && (
        <EditModal
          title="Edit distribution"
          fields={[
            { k: 'q', l: `Quantity (${edit.u})`, t: 'number', v: edit.q },
            { k: 'note', l: 'Notes', v: edit.note || '' },
            { k: 'date', l: 'Date', t: 'date', v: edit.date },
          ]}
          onSave={(v) => {
            const q = +v.q || edit.q;
            if (edit.s === 'Distributed' && stock(S, edit.k).q + edit.q - q < 0) { alert('Not enough stock.'); return false; }
            update((n) => {
              const x = n.dist.find((z) => z.id === edit.id);
              if (x.s === 'Distributed') stock(n, x.k).q += x.q - q;
              x.q = q; x.note = v.note; x.date = v.date || x.date;
            });
          }}
          onDelete={() => update((n) => {
            const x = n.dist.find((z) => z.id === edit.id);
            if (x.s === 'Distributed') stock(n, x.k).q += x.q;
            n.dist = n.dist.filter((z) => z.id !== edit.id);
          })}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
