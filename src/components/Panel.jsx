export function Panel({ children, className = '' }) {
  return <section className={`glass rounded-2xl p-4 md:p-5 ${className}`}>{children}</section>;
}
