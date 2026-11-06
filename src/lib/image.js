// Crop to a 120px square JPEG data URL so photos stay small in localStorage.
export function shrink(file, cb) {
  const im = new Image();
  im.onload = () => {
    const c = document.createElement('canvas');
    c.width = c.height = 120;
    const s = Math.min(im.width, im.height);
    c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 120, 120);
    cb(c.toDataURL('image/jpeg', 0.6));
  };
  im.src = URL.createObjectURL(file);
}
