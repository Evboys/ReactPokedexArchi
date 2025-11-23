import React from "react";

type Stat = { k: string; v: string };
type Props = { stats: Stat[] };

export default function PokemonStats({ stats }: Props) {
  if (!stats || stats.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="font-semibold">Stats</h3>
      <ul className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
        {stats.map((s) => (
          <li key={s.k} className="text-sm">
            {s.k}: <strong>{s.v}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
