import { Rabbit } from "./Rabbit";

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <Rabbit mood="sleepy" size={84} />
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="max-w-sm text-sm muted">{description}</p>
      {children}
    </div>
  );
}
