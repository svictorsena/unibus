export const Skeleton = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-sm bg-[#39343F] ${className}`}
  />
);
