import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

type Props = {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
};

export default function Navbar({ darkMode, setDarkMode }: Props) {
  const { favorites } = useFavorites();
  const loc = useLocation();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="ReactPokedexArchi/" className="font-bold text-lg">
          React Pokédex
        </Link>
        <div className="flex items-center gap-4">
          <Link to="ReactPokedexArchi/" className={`${loc.pathname === "/" ? "underline" : ""}`}>
            Search
          </Link>
          <Link
            to="ReactPokedexArchi/favorites"
            className={`${loc.pathname === "/favorites" ? "underline" : ""}`}
          >
            Favorites ({favorites.length})
          </Link>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </nav>
  );
}
