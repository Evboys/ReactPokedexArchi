const BASE = "https://tyradex.vercel.app/api/v1/pokemon";

export type PokemonMinimal = {
  pokedex_id: number;
  name: { fr?: string; en?: string };
  sprites?: { regular?: string };
  types?: { name: string; image?: string }[];
};
//Récupérer la liste de tous les pokémons
export async function fetchAllPokemons(): Promise<PokemonMinimal[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as PokemonMinimal[];
}
//Récupérer un pokémon par son ID
export async function fetchPokemonById(id: string | number): Promise<any> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as any;
}

// Récupérer la chaîne d'évolution si l'endpoint existe. Retourne null en cas d'échec.
export async function fetchEvolutions(id: string | number): Promise<any | null> {
  try {
    const res = await fetch(`${BASE}/${id}/evolution`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default { fetchAllPokemons, fetchPokemonById, fetchEvolutions };
