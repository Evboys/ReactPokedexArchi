import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPokemonById, fetchEvolutions } from "../api/pokemon";

export default function PokemonDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evolutions, setEvolutions] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    setData(null);

    fetchPokemonById(id)
      .then((json) => {
        if (!mounted) return;
        setData(json);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // try to fetch evolutions (best-effort)
    fetchEvolutions(id).then((ev) => {
      if (mounted) setEvolutions(ev);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading)
    return <div className="text-center py-8">Chargement des détails...</div>;
  if (error) return <div className="text-center py-8">Erreur: {error}</div>;
  if (!data) return null;

  const types: string[] = (data.types || []).map((t: any) => t.name ?? t.type?.name ?? "");

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
      >
        ← Retour
      </button>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <img
            src={data.sprites?.other?.["official-artwork"]?.front_default ?? data.sprites?.front_default ?? data.sprites?.regular}
            alt={data.name}
            className="w-48 h-48 object-contain"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold">
            {data.name} <span className="text-sm text-gray-500">#{data.id ?? data.pokedex_id}</span>
          </h2>

          <div className="flex gap-2 mt-3">
            {types.map((t) => (
              <span key={t} className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-medium">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Stats</h3>
            <ul className="mt-2 space-y-1">
              {((data.stats || []) as any[]).map((s: any, i: number) => {
                const name = s.name ?? s.stat?.name ?? `stat-${i}`;
                const value = s.base_stat ?? s.value ?? s.amount ?? "?";
                return (
                  <li key={name + i} className="text-sm">
                    {name}: <strong>{value}</strong>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Capacités</h3>
            <div className="mt-2 flex gap-2 flex-wrap">
              {((data.abilities || []) as any[]).map((a: any, i: number) => {
                const name = a.ability?.name ?? a.name ?? `ability-${i}`;
                return (
                  <span key={name + i} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm">
                    {name}
                  </span>
                );
              })}
            </div>
          </div>

          {evolutions && (
            <div className="mt-4">
              <h3 className="font-semibold">Évolutions</h3>
              <pre className="mt-2 text-sm overflow-auto bg-gray-50 dark:bg-gray-700 p-2 rounded">{JSON.stringify(evolutions, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
