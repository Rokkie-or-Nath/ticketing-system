// Remounts on every navigation, so the entrance animation replays per page.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}