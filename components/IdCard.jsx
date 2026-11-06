'use client';
import qrcode from 'qrcode-generator';
import Modal from './Modal';
import Logo from './Logo';

export default function IdCard({ b, onClose }) {
  const q = qrcode(0, 'M');
  q.addData(b.id);
  q.make();
  return (
    <Modal>
      <div id="idc" style={{ padding: 14, background: '#fff', color: '#000', borderRadius: 10 }}>
        <Logo size={30} /><br />
        <b>{b.name}</b><br />
        {b.village} · {b.id}
        <div style={{ margin: '8px auto', width: 150 }} dangerouslySetInnerHTML={{ __html: q.createSvgTag(5, 0) }} />
      </div>
      <div className="g2" style={{ marginTop: 12 }}>
        <button className="btn g" onClick={onClose}>Close</button>
        <button className="btn" onClick={() => window.print()}>Print</button>
      </div>
    </Modal>
  );
}
