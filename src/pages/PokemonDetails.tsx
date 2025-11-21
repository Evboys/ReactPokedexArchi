import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPokemonById,
  fetchEvolutions,
  extractForms,
} from "../api/pokemon";

// Page de détails d'un pokémon
// - Affiche les informations principales (nom, id, image)
// - Affiche les types (avec image si disponible)
// - Propose des flèches (précédent / suivant) pour naviguer dans le Pokédex
// - Affiche la chaîne d'évolutions avec la condition d'évolution
// - Affiche les formes alternatives (Méga, Gigamax, Formes)
export default function PokemonDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // États locaux
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evolutions, setEvolutions] = useState<any | null>(null);
  const [forms, setForms] = useState<Array<any> | null>(null);

  // Helpers locaux
  // Récupère un nom lisible depuis différentes formes
  const getName = (n: any) => {
    if (!n) return "";
    if (typeof n === "string") return n;
    if (typeof n === "object")
      return n.fr ?? n.en ?? n.jp ?? n.name ?? n.forme ?? "";
    return String(n);
  };

  // Normalise les types en tableau d'objets { name, image? }
  const getTypes = (raw: any): Array<{ name: string; image?: string }> => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((t: any) => ({
        name: getName(t.name ?? t.type?.name ?? t),
        image: t.image ?? t.sprite ?? t.icon ?? undefined,
      }));
    }
    return [{ name: getName(raw), image: raw.image ?? undefined }];
  };

  // Normalise les capacités en tableau de chaînes
  const getAbilities = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw))
      return raw.map(
        (a: any, i: number) =>
          getName(a.ability?.name ?? a.name ?? a) || `ability-${i}`
      );
    return [getName(raw)];
  };

  // Normalise les stats pour affichage
  const getStats = (raw: any): Array<{ k: string; v: string }> => {
    if (!raw) return [];
    if (Array.isArray(raw))
      return raw.map((s: any, i: number) => ({
        k: s.name ?? s.stat?.name ?? `stat-${i}`,
        v: String(s.base_stat ?? s.value ?? s.amount ?? "?"),
      }));
    if (typeof raw === "object")
      return Object.entries(raw).map(([k, v]) => ({
        k,
        v: String(v),
      }));
    return [];
  };

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    setLoading(true);
    setError(null);
    setData(null);
    setEvolutions(null);
    setForms(null);

    (async () => {
      try {
        // 1) fetch principal
        const json = await fetchPokemonById(id);
        if (!mounted) return;
        setData(json);

        // 2) si la réponse contient déjà des évolutions, on les utilise
        if (json?.evolution) {
          setEvolutions(json.evolution);
        } else {
          // si pas d'evolution dans le payload, tenter le fallback en passant l'objet json
          const evFallback = await fetchEvolutions(json).catch(() => null);
          if (mounted && evFallback) setEvolutions(evFallback);
        }

        // 3) Extraire les formes à partir du pokémon principal
        try {
          const extracted = extractForms(json) ?? null;
          if (extracted && extracted.length > 0) {
            if (mounted) setForms(extracted);
          }
        } catch {
          // ignore
        }

        // 4) Si on n'a toujours pas de formes, essayer d'extraire via la chaîne d'évolution
        if (
          (!json?.evolution ||
            (json.evolution &&
              !json.evolution.mega &&
              !json.sprites?.mega &&
              !json.sprites?.gmax)) &&
          mounted
        ) {
          // on réutilise ev (évolutions) si présent, sinon on tente fetchEvolutions(json)
          const evForForms =
            json.evolution ?? (await fetchEvolutions(json).catch(() => null));

          if (evForForms) {
            const candidates: number[] = [];

            if (Array.isArray(evForForms.pre)) {
              evForForms.pre.forEach(
                (p: any) => p?.pokedex_id && candidates.push(p.pokedex_id)
              );
            }
            if (Array.isArray(evForForms.next)) {
              evForForms.next.forEach(
                (n: any) => n?.pokedex_id && candidates.push(n.pokedex_id)
              );
            }
            if (evForForms.pre?.pokedex_id)
              candidates.push(evForForms.pre.pokedex_id);
            if (evForForms.next?.pokedex_id)
              candidates.push(evForForms.next.pokedex_id);

            // unique + limite à 10 appels
            const uniqueCandidates = Array.from(new Set(candidates)).slice(
              0,
              10
            );
            const formsCollected: Array<any> = [];

            for (const pid of uniqueCandidates) {
              try {
                const pjson = await fetchPokemonById(pid).catch(() => null);
                if (!pjson) continue;
                const ext = extractForms(pjson);
                if (ext && ext.length > 0) formsCollected.push(...ext);
              } catch {
                /* ignore single errors */
              }
            }

            if (mounted && formsCollected.length > 0) {
              setForms(formsCollected);
            }
          }
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  // Affichages d'état
  if (loading)
    return <div className="text-center py-8">Chargement des détails...</div>;
  if (error) return <div className="text-center py-8">Erreur: {error}</div>;
  if (!data) return null;

  // Préparer données sûres pour affichage
  const displayName =
    getName(data.name) || String(data.pokedex_id ?? data.id ?? id);
  const numericId = Number(data.pokedex_id ?? data.id ?? id);

  const prevId = numericId > 1 ? numericId - 1 : null;
  const nextId = numericId ? numericId + 1 : null;

  const types = getTypes(data.types ?? data.type ?? data.types_list ?? []);
  const abilities = getAbilities(data.abilities ?? data.abilities_list ?? []);
  const stats = getStats(data.stats ?? data.base_stats ?? []);

  // -------------------- JSX --------------------
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      {/* Bouton retour */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
        >
          ← Retour
        </button>

        {/* Flèches de navigation Pokédex */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              prevId && navigate(`/ReactPokedexArchi/pokemon/${prevId}`)
            }
            disabled={!prevId}
            aria-label="Précédent"
            className="p-1 rounded disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() =>
              nextId && navigate(`/ReactPokedexArchi/pokemon/${nextId}`)
            }
            aria-label="Suivant"
            className="p-1 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Image officielle */}
        <div className="flex-shrink-0">
          <img
            src={
                data.sprites?.regular ??
              data.sprites?.other?.["official-artwork"]?.front_default ??
              data.sprites?.front_default 
              
            }
            alt={displayName}
            className="w-48 h-48 object-contain"
          />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            {displayName}
            <span className="text-sm text-gray-500">#{numericId}</span>
          </h2>

          {/* Types */}
          <div className="flex gap-2 mt-3">
            {types.map((t) => (
              <div
                key={t.name}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-medium"
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

          {/* Stats */}
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

          {/* Capacités */}
          <div className="mt-4">
            <h3 className="font-semibold">Capacités</h3>
            <div className="mt-2 flex gap-2 flex-wrap">
              {abilities.map((a, i) => (
                <span
                  key={a + i}
                  className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Évolutions */}
          {evolutions && (
            <div className="mt-4">
              <h3 className="font-semibold">Évolutions</h3>

              <div className="mt-2 space-y-3">
                {typeof evolutions === "object" &&
                !Array.isArray(evolutions) ? (
                  <div className="space-y-2">
                    {/* Pré-évolutions */}
                    {Array.isArray(evolutions.pre) &&
                      evolutions.pre.length > 0 && (
                        <div>
                          <div className="text-sm font-medium">
                            Pré-évolutions
                          </div>
                          <div className="mt-1 flex gap-2 flex-wrap">
                            {evolutions.pre.map((p: any) => (
                              <button
                                key={p.pokedex_id ?? getName(p)}
                                onClick={() =>
                                  p.pokedex_id &&
                                  navigate(
                                    `/ReactPokedexArchi/pokemon/${p.pokedex_id}`
                                  )
                                }
                                className="flex items-center gap-2 px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm"
                              >
                                <span>{getName(p.name) || getName(p)}</span>
                                {p.condition && (
                                  <small className="text-xs text-gray-500">
                                    {p.condition}
                                  </small>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Évolution suivante */}
                    {evolutions.next && (
                      <div>
                        <div className="text-sm font-medium">
                          Évolution suivante
                        </div>
                        <div className="mt-1 flex gap-2 flex-wrap">
                          {Array.isArray(evolutions.next) ? (
                            evolutions.next.map((n: any) => (
                              <button
                                key={n.pokedex_id ?? getName(n)}
                                onClick={() =>
                                  n.pokedex_id &&
                                  navigate(
                                    `/ReactPokedexArchi/pokemon/${n.pokedex_id}`
                                  )
                                }
                                className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm"
                              >
                                {getName(n)}
                                {n.condition && (
                                  <small className="text-xs text-gray-500">
                                    {n.condition}
                                  </small>
                                )}
                              </button>
                            ))
                          ) : (
                            <button
                              onClick={() =>
                                evolutions.next.pokedex_id &&
                                navigate(
                                  `/ReactPokedexArchi/pokemon/${evolutions.next.pokedex_id}`
                                )
                              }
                              className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm"
                            >
                              {getName(evolutions.next)}
                              {evolutions.next.condition && (
                                <small className="text-xs text-gray-500">
                                  {evolutions.next.condition}
                                </small>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : Array.isArray(evolutions) ? (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {evolutions.map((ev: any) => (
                      <div
                        key={getName(ev) || JSON.stringify(ev)}
                        className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-sm"
                      >
                        {getName(ev) || JSON.stringify(ev)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="mt-2 text-sm overflow-auto bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {JSON.stringify(evolutions, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formes alternatives */}
      {forms && forms.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">
            Autres formes (Méga / Gigamax / Formes)
          </h3>
          <div className="mt-2 flex gap-3 flex-wrap">
            {forms.map((f: any, i: number) => (
              <div
                key={f.name ?? i}
                className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-sm flex items-center gap-2"
              >
                {f.sprites?.regular && (
                  <img
                    src={f.sprites.regular}
                    alt={f.name ?? `forme-${i}`}
                    className="w-10 h-10 object-contain"
                  />
                )}
                <div>
                  <div className="font-medium">{f.name}</div>
                  {f.sprites?.regular && (
                    <div className="text-xs text-gray-500">sprite</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
