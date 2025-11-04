import React from "react";
import { useFavorites } from "../context/FavoritesContext";
import PokemonCard from "../components/PokemonCard";

export default function Favorites() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) return <p>Tu n'as pas encore de favoris.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {favorites.map((p) => (
        <PokemonCard key={p.pokedex_id} pokemon={p} />
      ))}
    </div>
  );
}
