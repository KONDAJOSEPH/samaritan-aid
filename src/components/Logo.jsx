export default function Logo({ size = 44, white = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill={white ? '#fff' : '#2563EB'} />
      <path d="M24 36S11 28 11 19a6.5 6.5 0 0 1 13-1 6.5 6.5 0 0 1 13 1c0 9-13 17-13 17z" fill={white ? '#2563EB' : '#fff'} />
    </svg>
  );
}
