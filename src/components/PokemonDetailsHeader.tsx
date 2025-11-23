import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  displayName: string;
  numericId: number;
  imageSrc?: string;
  prevId: number | null;
  nextId: number | null;
};

export default function PokemonDetailsHeader({
  displayName,
  numericId,
  imageSrc,
  prevId,
  nextId,
}: Props) {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              prevId && navigate(`/ReactPokedexArchi/pokemon/${prevId}`)
            }
            disabled={!prevId}
            aria-label="Précédent"
            className="p-1 rounded disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() =>
              nextId && navigate(`/ReactPokedexArchi/pokemon/${nextId}`)
            }
            aria-label="Suivant"
            className="p-1 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex-shrink-0 flex justify-center">
          <img
            src={imageSrc}
            alt={displayName}
            className="w-72 h-72 object-contain items-center justify-center"
          />
        </div>
        <div className="flex justify-center">
          <h2 className="text-2xl font-bold">
            {displayName}{" "}
            <span className="text-sm text-gray-500">#{numericId}</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
