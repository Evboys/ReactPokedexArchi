import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import PokemonCard from "../components/PokemonCard";
import { PokemonMinimal } from "../context/FavoritesContext";
import { useFetch } from "../hooks/useFetch";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonMinimal | null>(null);

  // Fetch Pokémon par nom
  const { data, loading, error } = useFetch<PokemonMinimal | { error?: string }>(
    searchQuery ? `https://tyradex.vercel.app/api/v1/pokemon/${encodeURIComponent(searchQuery)}` : null
  );

  useEffect(() => {
    if (data && !("error" in data)) {
      setSelectedPokemon(data as PokemonMinimal);
    } else {
      setSelectedPokemon(null);
    }
  }, [data]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-4">
      <SearchBar onSelect={(name) => setSearchQuery(name)} />

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-600">Erreur: {error.message}</p>}
      {!loading && !selectedPokemon && searchQuery && <p className="text-yellow-700">Aucun résultat</p>}

      {selectedPokemon && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <PokemonCard pokemon={selectedPokemon} />
        </div>
      )}
    </div>
  );
}
