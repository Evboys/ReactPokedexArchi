import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  evolutions: any;
  getName: (n: any) => string;
};

export default function PokemonEvolutions({ evolutions, getName }: Props) {
  const navigate = useNavigate();
  if (!evolutions) return null;
  return (
    <div className="mt-4">
      <h3 className="font-semibold">Évolutions</h3>
      <div className="mt-2 space-y-3">
        {typeof evolutions === "object" && !Array.isArray(evolutions) ? (
          <div className="space-y-2">
            {Array.isArray(evolutions.pre) && evolutions.pre.length > 0 && (
              <div>
                <div className="text-sm font-medium">Pré-évolutions</div>
                <div className="mt-1 flex gap-2 flex-wrap">
                  {evolutions.pre.map((p: any) => (
                    <button key={p.pokedex_id ?? getName(p)} onClick={() => p.pokedex_id && navigate(`/ReactPokedexArchi/pokemon/${p.pokedex_id}`)} className="flex items-center gap-2 px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm">
                      <span>{getName(p.name) || getName(p)}</span>
                      {p.condition && <small className="text-xs text-gray-500">{p.condition}</small>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {evolutions.next && (
              <div>
                <div className="text-sm font-medium">Évolution suivante</div>
                <div className="mt-1 flex gap-2 flex-wrap">
                  {Array.isArray(evolutions.next) ? (
                    evolutions.next.map((n: any) => (
                      <button key={n.pokedex_id ?? getName(n)} onClick={() => n.pokedex_id && navigate(`/ReactPokedexArchi/pokemon/${n.pokedex_id}`)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm">
                        {getName(n)} {n.condition && <small className="text-xs text-gray-500">{n.condition}</small>}
                      </button>
                    ))
                  ) : (
                    <button onClick={() => evolutions.next.pokedex_id && navigate(`/ReactPokedexArchi/pokemon/${evolutions.next.pokedex_id}`)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm">
                      {getName(evolutions.next)} {evolutions.next.condition && <small className="text-xs text-gray-500">{evolutions.next.condition}</small>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : Array.isArray(evolutions) ? (
          <div className="mt-2 flex gap-2 flex-wrap">
            {evolutions.map((ev: any) => (
              <div key={getName(ev) || JSON.stringify(ev)} className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-sm">
                {getName(ev) || JSON.stringify(ev)}
              </div>
            ))}
          </div>
        ) : (
          <pre className="mt-2 text-sm overflow-auto bg-gray-50 dark:bg-gray-700 p-2 rounded">{JSON.stringify(evolutions, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
