'use client';
import { useState } from 'react';
import { useApp } from '@/lib/store';
import { shrink } from '@/lib/image';
import EditModal from '@/components/EditModal';
import QrScanner from '@/components/QrScanner';
import IdCard from '@/components/IdCard';
import Modal from '@/components/Modal';

const EMPTY = { name: '', village: '', g: 'Female', age: '', ph: '', fam: 1, tag: 'None', photo: '' };
const TAGS = ['None', 'Widow', 'Child', 'Disabled'];

export default function Beneficiaries() {
  const { S, update } = useApp();
  const [f, setF] = useState(EMPTY), [q, setQ] = useState(''), [sc, setSc] = useState('');
  const [card, setCard] = useState(null), [edit, setEdit] = useState(null), [scan, setScan] = useState(false), [ver, setVer] = useState(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const register = () => {
    if (!f.name.trim()) { alert('Enter the full name.'); return; }
    const id = 'SB-' + String(Math.max(0, ...S.ben.map((b) => +b.id.slice(3))) + 1).padStart(4, '0');
    const b = { id, name: f.name.trim(), village: f.village.trim() || 'Unknown', fam: +f.fam || 1, tag: f.tag, photo: f.photo, g: f.g, age: f.age, ph: f.ph.trim() };
    update((n) => { n.ben.push(b); });
    setF(EMPTY);
    setCard(b);
  };
  const verify = (id) => {
    const b = S.ben.find((x) => x.id === id.trim().toUpperCase());
    if (!b) { alert('ID not found.'); return; }
    setVer(b);
  };
  const shown = S.ben.filter((b) => (b.name + b.village + b.id).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="card">
        <label>Photo</label>
        <input key={S.ben.length} type="file" accept="image/*" capture="user" onChange={(e) => e.target.files[0] && shrink(e.target.files[0], (d) => set('photo', d))} />
        <label>Full name</label><input value={f.name} onChange={(e) => set('name', e.target.value)} />
        <label>Village</label><input value={f.village} onChange={(e) => set('village', e.target.value)} />
        <label>Gender</label>
        <select value={f.g} onChange={(e) => set('g', e.target.value)}><option>Female</option><option>Male</option></select>
        <label>Age</label><input type="number" min="0" value={f.age} onChange={(e) => set('age', e.target.value)} />
        <label>Phone (optional)</label><input type="tel" value={f.ph} onChange={(e) => set('ph', e.target.value)} />
        <label>Family size</label><input type="number" min="1" value={f.fam} onChange={(e) => set('fam', e.target.value)} />
        <label>Vulnerable tag</label>
        <select value={f.tag} onChange={(e) => set('tag', e.target.value)}>{TAGS.map((t) => <option key={t}>{t}</option>)}</select>
        <button className="btn" onClick={register}>Register and create QR card</button>
      </div>

      <div className="card">
        <h3>Check ID before distribution</h3>
        <input value={sc} onChange={(e) => setSc(e.target.value)} placeholder="Scan or type card ID, e.g. SB-0001" />
        <div className="g2">
          <button className="btn" onClick={() => setScan(true)}>Scan QR card</button>
          <button className="btn g" onClick={() => verify(sc)}>Verify ID</button>
        </div>
      </div>

      <div className="card">
        <h3>Registered ({S.ben.length})</h3>
        <input placeholder="Search name, village or ID" value={q} onChange={(e) => setQ(e.target.value)} />
        {shown.map((b) => (
          <div className="it" key={b.id}>
            {b.photo ? <img className="ph" src={b.photo} alt="" /> : <div className="ph ini">{b.name[0] || '?'}</div>}
            <div>
              <b>{b.name}</b>
              <div className="m">{b.id} · {b.village} · {b.g || ''}{b.age ? `, ${b.age} yrs` : ''} · family of {b.fam}{b.ph ? ` · ${b.ph}` : ''}</div>
              {b.tag !== 'None' && <span className="tag w">{b.tag}</span>}
            </div>
            <button className="btn s g" onClick={() => setEdit(b)}>Edit</button>
            <button className="btn s" onClick={() => setCard(b)}>Card</button>
          </div>
        ))}
      </div>

      {card && <IdCard b={card} onClose={() => setCard(null)} />}
      {scan && <QrScanner onClose={() => setScan(false)} onResult={(v) => { setScan(false); setSc(v); verify(v); }} />}
      {ver && (
        <Modal>
          {ver.photo && <img className="ph" style={{ width: 110, height: 110 }} src={ver.photo} alt="" />}
          <h3>{ver.name}</h3>
          <p className="m">{ver.id} · {ver.village}<br />Compare the photo with the person in front of you.</p>
          <div className="g2">
            <button className="btn g" onClick={() => { setVer(null); alert('Verification failed. Do not distribute.'); }}>Not a match</button>
            <button className="btn" onClick={() => { setVer(null); alert('Verified. Go to the Aid page.'); }}>Match</button>
          </div>
        </Modal>
      )}
      {edit && (
        <EditModal
          title={'Edit ' + edit.id}
          fields={[
            { k: 'photo', l: 'Change photo', t: 'file' },
            { k: 'name', l: 'Full name', v: edit.name }, { k: 'village', l: 'Village', v: edit.village },
            { k: 'g', l: 'Gender', v: edit.g || 'Female', o: ['Female', 'Male'] },
            { k: 'age', l: 'Age', t: 'number', v: edit.age || '' }, { k: 'ph', l: 'Phone', t: 'tel', v: edit.ph || '' },
            { k: 'fam', l: 'Family size', t: 'number', v: edit.fam }, { k: 'tag', l: 'Vulnerable tag', v: edit.tag, o: TAGS },
          ]}
          onSave={(v) => update((n) => {
            const b = n.ben.find((z) => z.id === edit.id);
            if (v.photo) b.photo = v.photo;
            b.name = v.name.trim() || b.name; b.village = v.village.trim() || b.village;
            b.fam = +v.fam || 1; b.tag = v.tag; b.g = v.g; b.age = v.age; b.ph = v.ph;
          })}
          onDelete={() => update((n) => { n.ben = n.ben.filter((z) => z.id !== edit.id); })}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
