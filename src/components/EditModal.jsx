'use client';
import { useState } from 'react';
import Modal from './Modal';
import { shrink } from '@/lib/image';

// fields: [{k, l, t?, v?, o?}]  t='file' = photo picker, o = select options.
// onSave(values) may return false to keep the dialog open.
export default function EditModal({ title, fields, onSave, onDelete, onClose }) {
  const [v, setV] = useState(() => Object.fromEntries(fields.filter((f) => f.t !== 'file').map((f) => [f.k, f.v ?? ''])));
  const [sure, setSure] = useState(false);
  const set = (k, x) => setV((p) => ({ ...p, [k]: x }));
  return (
    <Modal left>
      <h3>{title}</h3>
      {fields.map((f) => (
        <div key={f.k}>
          <label>{f.l}</label>
          {f.t === 'file' ? (
            <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && shrink(e.target.files[0], (d) => set(f.k, d))} />
          ) : f.o ? (
            <select value={v[f.k]} onChange={(e) => set(f.k, e.target.value)}>{f.o.map((o) => <option key={o}>{o}</option>)}</select>
          ) : (
            <input type={f.t || 'text'} value={v[f.k]} onChange={(e) => set(f.k, e.target.value)} />
          )}
        </div>
      ))}
      <div className="g2">
        <button className="btn g" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={() => { if (onSave(v) !== false) onClose(); }}>Save changes</button>
      </div>
      {onDelete && (
        <button className="btn d" style={{ marginTop: 10 }} onClick={() => { if (sure) { if (onDelete() !== false) onClose(); } else setSure(true); }}>
          {sure ? 'Tap again to confirm delete' : 'Delete'}
        </button>
      )}
    </Modal>
  );
}
