import React, { useState, useEffect, useMemo, useRef } from "react";
import PokemonCard from "../components/PokemonCard";
import { PokemonMinimal } from "../context/FavoritesContext";

export default function Search() {
  const [pokemons, setPokemons] = useState<PokemonMinimal[]>([]);
  const [query, setQuery] = useState("");

  const inputRef = useRef<HTMLInputElement>(null); //Référence à l’input

  useEffect(() => {
    fetch("https://tyradex.vercel.app/api/v1/pokemon")
      .then((res) => res.json())
      .then(setPokemons);
  }, []);

  //évite le recalcul de la liste filtrée
  const filteredPokemons = useMemo(() => {
    return pokemons.filter((p) =>
      p.name.fr?.toLowerCase().includes(query.toLowerCase())
    );
  }, [pokemons, query]);

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
        {filteredPokemons.map((p) => (
          <PokemonCard key={p.pokedex_id} pokemon={p} />
        ))}
      </div>
    </div>
  );
}
