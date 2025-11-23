import React from "react";

type TypeItem = { name: string; image?: string };
type Props = { types: TypeItem[] };

export default function PokemonTypes({ types }: Props) {
  if (!types || types.length === 0) return null;
  return (
    <div className="flex justify-center gap-2 mt-3">
      {types.map((t) => (
        <div
          key={t.name}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium"
        >
          {t.image && (
            <img
              src={t.image}
              alt={t.name}
              className="w-6 h-6 object-contain"
            />
          )}
          <span>{t.name}</span>
        </div>
      ))}
    </div>
  );
}
