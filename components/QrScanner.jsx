'use client';
import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';

// Opens the rear camera. Uses the browser's BarcodeDetector when present, otherwise jsQR.
export default function QrScanner({ onResult, onClose }) {
  const vid = useRef(null);
  const [msg, setMsg] = useState('Point the camera at the card.');

  useEffect(() => {
    let on = true, stream, timer;
    (async () => {
      if (!navigator.mediaDevices) { setMsg('Camera not available. Type the card ID instead.'); return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!on) { stream.getTracks().forEach((t) => t.stop()); return; }
        const v = vid.current;
        v.srcObject = stream;
        await v.play();
        const det = window.BarcodeDetector ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null;
        const jsQR = det ? null : (await import('jsqr')).default;
        const cv = document.createElement('canvas');
        const cx = cv.getContext('2d', { willReadFrequently: true });
        const tick = async () => {
          if (!on) return;
          let t = null;
          if (v.readyState >= 2) {
            try {
              if (det) { const r = await det.detect(v); t = r[0]?.rawValue; }
              else {
                cv.width = v.videoWidth; cv.height = v.videoHeight;
                cx.drawImage(v, 0, 0);
                const d = cx.getImageData(0, 0, cv.width, cv.height);
                t = jsQR(d.data, d.width, d.height)?.data;
              }
            } catch {}
          }
          if (t) { onResult(t.trim()); return; }
          timer = setTimeout(tick, 200);
        };
        tick();
      } catch { setMsg('Camera blocked or unavailable. Allow camera access, or type the card ID.'); }
    })();
    return () => { on = false; clearTimeout(timer); stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal>
      <h3>Scan QR card</h3>
      <video ref={vid} playsInline muted style={{ width: '100%', borderRadius: 10, background: '#000' }} />
      <p className="m">{msg}</p>
      <button className="btn g" onClick={onClose}>Cancel</button>
    </Modal>
  );
}
