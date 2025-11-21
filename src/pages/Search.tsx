import React, { useState, useEffect, useMemo, useRef } from "react";
import PokemonCard from "../components/PokemonCard";
import { PokemonMinimal } from "../context/FavoritesContext";
import { fetchAllPokemons } from "../api/pokemon";

export default function Search() {
  const [pokemons, setPokemons] = useState<PokemonMinimal[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const inputRef = useRef<HTMLInputElement>(null); //Référence à l’input

  useEffect(() => {
    //fetcher la liste des pokémons au montage
    let mounted = true;
    fetchAllPokemons()
      // En cas d'erreur, on vide la liste
      .then((list) => {
        if (mounted) setPokemons(list);
      })
      .catch(() => {
        if (mounted) setPokemons([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  //évite le recalcul de la liste filtrée
  const filteredPokemons = useMemo(() => {
    return pokemons.filter((p) =>
      p.name.fr?.toLowerCase().includes(query.toLowerCase())
    );
  }, [pokemons, query]);

  // Reset la page à 1 à chaque changement de requête
  useEffect(() => {
    setPage(1);
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filteredPokemons.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPokemons.slice(start, start + pageSize);
  }, [filteredPokemons, page]);

  //focus au montage
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un Pokémon"
        className="border p-2 rounded mb-4 w-full"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginated.map((p) => (
          <PokemonCard key={p.pokedex_id} pokemon={p} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((s) => Math.max(1, s - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
        >
          Précédent
        </button>

        <div className="text-sm">
          Page {page} / {pageCount} ({filteredPokemons.length} résultats)
        </div>

        <button
          onClick={() => setPage((s) => Math.min(pageCount, s + 1))}
          disabled={page === pageCount}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
