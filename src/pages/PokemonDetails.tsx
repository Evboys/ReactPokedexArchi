import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchPokemonById,
  fetchEvolutions,
  extractForms,
} from "../api/pokemon";
import PokemonDetailsHeader from "../components/PokemonDetailsHeader";
import PokemonTypes from "../components/PokemonTypes";
import PokemonStats from "../components/PokemonStats";
import PokemonAbilities from "../components/PokemonAbilities";
import PokemonEvolutions from "../components/PokemonEvolutions";
import PokemonForms from "../components/PokemonForms";

// Page de détails d'un pokémon
export default function PokemonDetails() {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<any | null>(null);
  const [shiny, setShiny] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evolutions, setEvolutions] = useState<any | null>(null);
  const [forms, setForms] = useState<Array<any> | null>(null);

  const getName = (n: any) => {
    if (!n) return "";
    if (typeof n === "string") return n;
    if (typeof n === "object")
      return n.fr ?? n.en ?? n.jp ?? n.name ?? n.forme ?? "";
    return String(n);
  };

  const getTypes = (raw: any): Array<{ name: string; image?: string }> => {
    if (!raw) return [];
    if (Array.isArray(raw))
      return raw.map((t: any) => ({
        name: getName(t.name ?? t.type?.name ?? t),
        image: t.image ?? t.sprite ?? t.icon ?? undefined,
      }));
    return [{ name: getName(raw), image: raw.image ?? undefined }];
  };

  const getAbilities = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw))
      return raw.map(
        (a: any, i: number) =>
          getName(a.ability?.name ?? a.name ?? a) || `ability-${i}`
      );
    return [getName(raw)];
  };

  const getStats = (raw: any): Array<{ k: string; v: string }> => {
    if (!raw) return [];
    if (Array.isArray(raw))
      return raw.map((s: any, i: number) => ({
        k: s.name ?? s.stat?.name ?? `stat-${i}`,
        v: String(s.base_stat ?? s.value ?? s.amount ?? "?"),
      }));
    if (typeof raw === "object")
      return Object.entries(raw).map(([k, v]) => ({ k, v: String(v) }));
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
        // fetch principal
        const json = await fetchPokemonById(id);
        if (!mounted) return;
        setData(json);

        // évolutions
        if (json?.evolution) setEvolutions(json.evolution);
        else {
          const ev = await fetchEvolutions(id).catch(() => null);
          if (mounted && ev) setEvolutions(ev);
        }

        try {
          const extracted = extractForms(json);
          if (extracted && extracted.length > 0) setForms(extracted);
        } catch {
          // ignore errors
        }

        // fallback : si pas de formes, tenter via la chaîne d'évolution
        if (
          (!json?.evolution ||
            (json.evolution &&
              !json.evolution.mega &&
              !json.sprites?.mega &&
              !json.sprites?.gmax)) &&
          mounted
        ) {
          const evForForms =
            json.evolution ?? (await fetchEvolutions(id).catch(() => null));
          if (evForForms) {
            const candidates: number[] = [];
            if (Array.isArray(evForForms.pre))
              evForForms.pre.forEach(
                (p: any) => p?.pokedex_id && candidates.push(p.pokedex_id)
              );
            if (Array.isArray(evForForms.next))
              evForForms.next.forEach(
                (n: any) => n?.pokedex_id && candidates.push(n.pokedex_id)
              );
            if (evForForms.pre?.pokedex_id)
              candidates.push(evForForms.pre.pokedex_id);
            if (evForForms.next?.pokedex_id)
              candidates.push(evForForms.next.pokedex_id);

            const uniqueCandidates = Array.from(new Set(candidates)).slice(
              0,
              10
            );
            const formsCollected: any[] = [];
            for (const pid of uniqueCandidates) {
              try {
                const pjson = await fetchPokemonById(pid).catch(() => null);
                if (!pjson) continue;
                const ext = extractForms(pjson);
                if (ext && ext.length > 0) formsCollected.push(...ext);
              } catch {
                // ignore errors
              }
            }
            if (mounted && formsCollected.length > 0) setForms(formsCollected);
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

  if (loading)
    return <div className="text-center py-8">Chargement des détails...</div>;
  if (error) return <div className="text-center py-8">Erreur: {error}</div>;
  if (!data) return null;

  const displayName =
    getName(data.name) || String(data.pokedex_id ?? data.id ?? id);
  const numericId = Number(data.pokedex_id ?? data.id ?? id);
  const prevId = numericId > 1 ? numericId - 1 : null;
  const nextId = numericId ? numericId + 1 : null;

  const types = getTypes(data.types ?? data.type ?? data.types_list ?? []);
  const abilities = getAbilities(data.abilities ?? data.abilities_list ?? []);
  const stats = getStats(data.stats ?? data.base_stats ?? []);
  const getSprite = (useShiny: boolean) => {
    if (useShiny) {
      return data?.sprites?.shiny ?? null;
    }
    return data?.sprites?.regular ?? null;
  };

  const imageSrc = getSprite(shiny);

  // Filtrer les forms pour n'afficher que les formes alternatives (méga/gigamax/formes différentes)
  const baseNameLower = getName(data.name).toLowerCase();

  const baseRegular = data?.sprites?.regular ?? null;
  const formsDisplayed = (forms ?? []).filter((f: any) => {
    const fname = String(f.name ?? "").toLowerCase();
    const sprite = f?.sprites?.regular ?? null;
    const spriteDifferent = sprite && baseRegular && sprite !== baseRegular;
    const isMega =
      fname.includes("méga") ||
      fname.includes("mega") ||
      fname.includes("gigamax") ||
      fname.includes("gmax");
    return isMega || spriteDifferent || (fname && fname !== baseNameLower);
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <PokemonDetailsHeader
        displayName={displayName}
        numericId={numericId}
        imageSrc={imageSrc}
        prevId={prevId}
        nextId={nextId}
      />

      <div className="mt-4">
        {/* Toggle Normal / Shiny */}
        <div className="flex items-center gap-2 mb-3">
          <div className="text-sm">Afficher :</div>
          <button
            onClick={() => setShiny(false)}
            className={`px-2 py-1 rounded ${
              !shiny ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setShiny(true)}
            className={`px-2 py-1 rounded ${
              shiny ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Shiny
          </button>
        </div>

        <PokemonTypes types={types} />
        <PokemonStats stats={stats} />
        <PokemonAbilities abilities={abilities} />
        <PokemonEvolutions evolutions={evolutions} getName={getName} />
        <PokemonForms forms={formsDisplayed} shiny={shiny} />
      </div>
    </div>
  );
}
