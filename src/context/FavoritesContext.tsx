import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

// Type Pokémon
export type PokemonMinimal = {
  pokedex_id: number;
  name: { fr?: string; en?: string };
  sprites?: { regular?: string };
  types?: { name: string; image?: string }[];
};

// Type du context
type FavoritesContextType = {
  favorites: PokemonMinimal[];
  toggleFavorite: (pokemon: PokemonMinimal) => void;
  isFavorite: (id: number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<PokemonMinimal[]>(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });

  
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

 
  const toggleFavorite = useCallback((pokemon: PokemonMinimal) => {
    setFavorites((prev) =>
      prev.some((p) => p.pokedex_id === pokemon.pokedex_id)
        ? prev.filter((p) => p.pokedex_id !== pokemon.pokedex_id)
        : [...prev, pokemon]
    );
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.some((p) => p.pokedex_id === id),
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context)
    throw new Error("useFavorites must be used within a FavoritesProvider");
  return context;
};
