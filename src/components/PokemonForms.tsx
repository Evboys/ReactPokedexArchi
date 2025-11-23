import React from "react";

type FormItem = {
  name: string;
  sprites?: { regular?: string; shiny?: string };
};
type Props = { forms: FormItem[]; shiny?: boolean };

export default function PokemonForms({ forms, shiny = false }: Props) {
  if (!forms || forms.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="font-semibold">Autres formes (Méga / Gigamax / Formes)</h3>
      <div className="mt-2 flex gap-3 flex-wrap">
        {forms.map((f: any, i: number) => {
          const sprite = shiny
            ? f.sprites?.shiny ?? null
            : f.sprites?.regular ?? null;
          return (
            <div
              key={f.name ?? i}
              className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-sm flex items-center gap-2"
            >
              {sprite && (
                <img
                  src={sprite}
                  alt={f.name ?? `forme-${i}`}
                  className="w-24 h-24 object-contain"
                />
              )}
              <div>
                <div className="font-medium">{f.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
