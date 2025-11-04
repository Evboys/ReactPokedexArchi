import React from "react";
import { motion } from "framer-motion";
import { PokemonMinimal, useFavorites } from "../context/FavoritesContext";
import { FaStar, FaRegStar } from "react-icons/fa";

type Props = { pokemon: PokemonMinimal };

export default function PokemonCard({ pokemon }: Props) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(pokemon.pokedex_id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="border rounded-xl shadow p-4 bg-white dark:bg-gray-800 flex flex-col items-center relative"
    >
      {/* Étoile Favoris */}
      <button
        onClick={() => toggleFavorite(pokemon)}
        className="absolute top-2 right-2 text-yellow-400 text-xl"
      >
        {fav ? <FaStar /> : <FaRegStar />}
      </button>

      <img
        src={pokemon.sprites?.regular}
        alt={pokemon.name?.fr ?? pokemon.name?.en}
        className="h-28 w-28 object-contain"
      />
      <h3 className="mt-2 font-semibold text-lg text-center">
        {pokemon.name?.fr ?? pokemon.name?.en}
      </h3>

      {/* Types avec icône */}
      <div className="flex gap-2 mt-2 flex-wrap justify-center">
        {pokemon.types?.map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-medium"
          >
            {t.image && (
              <img
                src={t.image}
                alt={t.name}
                className="h-4 w-4 object-contain"
              />
            )}
            <span>{t.name}</span>
          </div>
        ))}
      </div>
    </motion.article>
  );
}
