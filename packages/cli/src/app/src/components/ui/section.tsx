export default function Section({ children }: { children: React.ReactNode }) {
  return <section className="flex flex-1 flex-col gap-5 overflow-auto">{children}</section>
}
