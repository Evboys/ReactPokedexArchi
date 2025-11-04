import React, { useState, useEffect, useRef } from "react";
import { useFetch } from "../hooks/useFetch";
import { PokemonMinimal } from "../context/FavoritesContext";

type Props = {
  onSelect: (pokemonName: string) => void; // renvoie le Pokémon sélectionné à Search.tsx
};

export default function SearchBar({ onSelect }: Props) {
  const [value, setValue] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fonction pour enlever les accents
  const removeAccents = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Fetch liste de Pokémon correspondant à la recherche
  const { data: allPokemon } = useFetch<PokemonMinimal[]>(
    query ? `https://tyradex.vercel.app/api/v1/pokemon?search=${query}` : null
  );

  // Debounce input pour éviter trop de requêtes
  useEffect(() => {
    if (value.trim() === "") {
      setQuery(null);
      return;
    }
    const handler = setTimeout(() => {
      setQuery(removeAccents(value.trim().toLowerCase()));
    }, 300);
    return () => clearTimeout(handler);
  }, [value]);

  // Fermer dropdown quand clic en dehors
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Sélection d’un Pokémon depuis le dropdown
  const handleSelect = (pokemon: PokemonMinimal) => {
    const name = pokemon.name?.fr ?? pokemon.name?.en ?? "";
    setValue(name);
    onSelect(removeAccents(name));
    setShowDropdown(false);
  };

  // Bouton Search
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSelect(removeAccents(value.trim()));
    setShowDropdown(false);
  };

  // Filtrage "contient"
  const filtered = allPokemon
    ? allPokemon.filter((p) =>
        (p.name?.fr ?? p.name?.en ?? "")
          .toLowerCase()
          .includes(value.toLowerCase())
      )
    : [];

  return (
    <div ref={ref} className="relative">
      <form onSubmit={submit} className="flex gap-2 mb-4">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowDropdown(true);
          }}
          className="flex-1 p-2 border rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Nom ou ID du Pokémon"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </form>

      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow max-h-60 overflow-auto">
          {filtered.map((p) => (
            <li
              key={p.pokedex_id}
              onClick={() => handleSelect(p)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {p.name?.fr ?? p.name?.en}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
