import React, { useState } from "react";
import { motion } from "framer-motion";
import { PokemonMinimal, useFavorites } from "../context/FavoritesContext";
import { useNavigate } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa";
import { GiSparkles } from "react-icons/gi";

type Props = { pokemon: PokemonMinimal };

const Sparkle = ({ x, y }: { x: number; y: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [0, 2, 1], opacity: [0, 1, 0] }}
    transition={{ duration: 0.8 }}
    className="absolute pointer-events-none"
    style={{
      top: y,
      left: x,
      fontSize: "16px",
    }}
  >
    ✨
  </motion.div>
);

export default function PokemonCard({ pokemon }: Props) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(pokemon.pokedex_id);
  const navigate = useNavigate();

  const [shiny, setShiny] = useState<boolean>(false);
  const [sparkles, setSparkles] = useState<{ x: number; y: number }[]>([]);

  const triggerSparkles = () => {
    const newSparkles = Array.from({ length: 6 }).map(() => ({
      x: 40 + Math.random() * 60,
      y: 20 + Math.random() * 60,
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 800);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      onClick={() =>
        navigate(`/ReactPokedexArchi/pokemon/${pokemon.pokedex_id}`)
      }
      className="border rounded-xl shadow p-4 bg-white dark:bg-gray-800 flex flex-col items-center relative cursor-pointer"
    >
      {/* Bouton Favori */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(pokemon);
        }}
        className="absolute top-2 right-2 text-yellow-400 text-xl"
      >
        {fav ? <FaStar /> : <FaRegStar />}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setShiny((prev) => !prev);
          triggerSparkles();
        }}
        className={`absolute top-2 left-2 text-xl transition-transform ${
          shiny ? "text-yellow-300 scale-110" : "text-gray-400"
        }`}
      >
        <GiSparkles />
      </button>

      {sparkles.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} />
      ))}

      <img
        src={shiny ? pokemon.sprites?.shiny : pokemon.sprites?.regular}
        alt={pokemon.name?.fr}
        className="h-28 w-28 object-contain transition-all duration-200"
      />

      <h3 className="mt-2 font-semibold text-lg text-center">
        {pokemon.name?.fr}
      </h3>

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
