'use client';
import { useState } from 'react';
import { useApp, stock, entry } from '@/lib/store';
import EditModal from '@/components/EditModal';

export default function Inventory() {
  const { S, update } = useApp();
  const [mv, setMv] = useState({ i: '', t: 'in', p: '', q: 1 }), [ni, setNi] = useState({ n: '', u: '', q: 0, d: false });
  const [err, setErr] = useState(''), [edit, setEdit] = useState(null);
  const item = mv.i || S.inv[0]?.n || '';

  const move = () => {
    const it = stock(S, item), q = +mv.q;
    if (!it || !(q > 0)) { setErr('Choose an item and a quantity.'); return; }
    if (mv.t === 'out' && it.q < q) { setErr('Not enough stock.'); return; }
    setErr('');
    const p = mv.p.trim() || '—';
    update((n) => {
      stock(n, item).q += mv.t === 'in' ? q : -q;
      n.log.push(entry(item, (mv.t === 'in' ? 'Received from ' : 'Sent to village ') + p, mv.t === 'in' ? q : -q, true));
    });
    setMv({ ...mv, p: '', q: 1 });
  };
  const addItem = () => {
    const n = ni.n.trim();
    if (!n || stock(S, n)) { alert('Enter a new item name.'); return; }
    update((d) => { d.inv.push({ n, u: ni.u.trim() || 'items', q: +ni.q || 0, d: ni.d ? 1 : 0 }); });
    setNi({ n: '', u: '', q: 0, d: false });
  };
  const undo = (l) => {
    const it = stock(S, l.it);
    if (!it || it.q - l.q < 0) { alert('Cannot undo: stock would go below zero.'); return; }
    update((n) => { stock(n, l.it).q -= l.q; n.log = n.log.filter((z) => z.id !== l.id); });
  };

  return (
    <>
      <div className="card">
        <h3>Stock on hand</h3>
        {S.inv.map((i) => (
          <div className="it" key={i.n}>
            <div><b>{i.n}</b></div>
            <span className={'tag ' + (i.q < 100 ? 'b' : 'ok')}>{i.q} {i.u}{i.q < 100 ? ' · low' : ''}</span>
            <button className="btn s g" onClick={() => setEdit(i)}>Edit</button>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Add new item</h3>
        <label>Item name</label><input value={ni.n} onChange={(e) => setNi({ ...ni, n: e.target.value })} />
        <div className="g2">
          <div><label>Unit</label><input placeholder="kg, items, tabs" value={ni.u} onChange={(e) => setNi({ ...ni, u: e.target.value })} /></div>
          <div><label>Opening stock</label><input type="number" min="0" value={ni.q} onChange={(e) => setNi({ ...ni, q: e.target.value })} /></div>
        </div>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <input type="checkbox" checked={ni.d} onChange={(e) => setNi({ ...ni, d: e.target.checked })} style={{ width: 22, minHeight: 22, margin: 0 }} />This is a medicine
        </label>
        <button className="btn g" onClick={addItem}>Add item</button>
      </div>

      <div className="card">
        <h3>Record movement</h3>
        <label>Item</label>
        <select value={item} onChange={(e) => setMv({ ...mv, i: e.target.value })}>{S.inv.map((i) => <option key={i.n}>{i.n}</option>)}</select>
        <label>Step</label>
        <select value={mv.t} onChange={(e) => setMv({ ...mv, t: e.target.value })}><option value="in">Warehouse in (from source)</option><option value="out">Out to village</option></select>
        <label>Source or village</label><input placeholder="e.g. WFP Port Sudan, or Kalma" value={mv.p} onChange={(e) => setMv({ ...mv, p: e.target.value })} />
        <label>Quantity</label><input type="number" min="1" value={mv.q} onChange={(e) => setMv({ ...mv, q: e.target.value })} />
        <div className="err">{err}</div>
        <button className="btn" onClick={move}>Save movement</button>
      </div>

      <div className="card">
        <h3>Chain of custody</h3>
        {S.log.length === 0 && <p className="m">No movements yet.</p>}
        {S.log.slice().reverse().map((l) => (
          <div className="it" key={l.id}>
            <div><b>{l.it}</b><div className="m">{l.t} · {l.date}</div></div>
            <span className={'tag ' + (l.q > 0 ? 'ok' : 'w')}>{l.q > 0 ? '+' : ''}{l.q}</span>
            {l.m && <button className="btn s g" onClick={() => undo(l)}>Undo</button>}
          </div>
        ))}
      </div>

      {edit && (
        <EditModal
          title={'Adjust ' + edit.n}
          fields={[{ k: 'n', l: 'Item name', v: edit.n }, { k: 'u', l: 'Unit', v: edit.u }, { k: 'q', l: 'Stock count', t: 'number', v: edit.q }]}
          onSave={(v) => update((n) => {
            const it = stock(n, edit.n), nn = v.n.trim();
            if (nn && nn !== it.n && !stock(n, nn)) { // rename everywhere the item is referenced
              n.dist.forEach((d) => { if (d.k === it.n) d.k = nn; });
              n.log.forEach((l) => { if (l.it === it.n) l.it = nn; });
              n.clin.forEach((c) => { if (c.dg === it.n) c.dg = nn; });
              it.n = nn;
            }
            it.u = v.u.trim() || it.u;
            const q = Math.max(0, +v.q || 0);
            if (q !== it.q) { n.log.push(entry(it.n, 'Stock correction', q - it.q)); it.q = q; }
          })}
          onDelete={() => {
            if (S.dist.some((d) => d.k === edit.n) || S.clin.some((c) => c.dg === edit.n)) { alert('Item is used in records, so it cannot be deleted. Edit its name instead.'); return false; }
            update((n) => { n.inv = n.inv.filter((z) => z.n !== edit.n); });
          }}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
