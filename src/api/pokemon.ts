const BASE = "https://tyradex.vercel.app/api/v1/pokemon";

export type PokemonMinimal = {
  pokedex_id: number;
  name: { fr?: string; en?: string };
  sprites?: { regular?: string };
  types?: { name: string; image?: string }[];
};

//Récupérer la liste complète

export async function fetchAllPokemons(): Promise<PokemonMinimal[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return await res.json();
}

//Récupérer un Pokémon complet par ID

export async function fetchPokemonById(id: string | number): Promise<any> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return await res.json();
}

//Récupération évolutions (pré/next/mega)

export async function fetchEvolutions(pokemon: any) {
  const forms: Array<{ name: string; sprites: any }> = [];

  //Pré-évolution
  if (pokemon.evolution?.pre) {
    try {
      const pre = await fetchPokemonById(pokemon.evolution.pre);
      forms.push({ name: "Pré-évolution", sprites: pre.sprites });
    } catch {}
  }
  //Next-évolution
  if (pokemon.evolution?.next && Array.isArray(pokemon.evolution.next)) {
    for (const nextId of pokemon.evolution.next) {
      try {
        const next = await fetchPokemonById(nextId);
        forms.push({ name: "Next-évolution", sprites: next.sprites });
      } catch {}
    }
  }

  return forms;
}

export function extractForms(pokemon: any) {
  const forms: Array<{ name: string; sprites: any }> = [];

  //Mega par evolution.mega
  if (pokemon.evolution?.mega && Array.isArray(pokemon.evolution.mega)) {
    pokemon.evolution.mega.forEach((m: any) => {
      forms.push({
        name: m.orbe ?? m.name ?? "Méga-évolution",
        sprites: m.sprites,
      });
    });
  }

  //Mega X/Y par les sprites.mega.x/y
  const megaFromSprites = pokemon.sprites?.mega;
  if (megaFromSprites) {
    if (megaFromSprites.x) {
      forms.push({
        name: `${pokemon.name.fr} (Méga X)`,
        sprites: megaFromSprites.x,
      });
    }
    if (megaFromSprites.y) {
      forms.push({
        name: `${pokemon.name.fr} (Méga Y)`,
        sprites: megaFromSprites.y,
      });
    }
  }

  //GIGAMAX
  if (pokemon.sprites?.gmax) {
    forms.push({
      name: `${pokemon.name.fr} (Gigamax)`,
      sprites: pokemon.sprites.gmax,
    });
  }

  return forms;
}

export default {
  fetchAllPokemons,
  fetchPokemonById,
  fetchEvolutions,
  extractForms,
};
