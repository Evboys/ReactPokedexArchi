import React from "react";

type Props = { abilities: string[] };

export default function PokemonAbilities({ abilities }: Props) {
  if (!abilities || abilities.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="font-semibold">Capacités</h3>
      <div className="mt-2 flex gap-2 flex-wrap">
        {abilities.map((a, i) => (
          <span key={a + i} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm">
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}
