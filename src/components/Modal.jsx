export default function Modal({ children, left }) {
  return (
    <div className="modal">
      <div className="card" style={left ? { textAlign: 'left' } : undefined}>{children}</div>
    </div>
  );
}
