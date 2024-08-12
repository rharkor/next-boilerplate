export default function Section({ children }: { children: React.ReactNode }) {
  return <section className="flex min-w-0 flex-1 flex-col gap-5">{children}</section>
}
