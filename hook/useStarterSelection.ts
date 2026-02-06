import { useState, useCallback } from 'react';
import { selectStarter, setTrainerName } from '../pages/pokedex/starter/StarterSelection.telefunc';
import type { StarterSelectionResult } from '../type/starterSelection';

type TrainerNameResult = {
  success: true;
} | {
  success: false;
  error: string;
};

export function useStarterSelection(userId: number) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectStarter = useCallback(async (
    pokemonId: number,
    pokemonName: string
  ): Promise<StarterSelectionResult> => {
    setIsSelecting(true);
    setError(null);

    try {
      const result = await selectStarter(pokemonId, userId);

      if (!result.success) {
        const errorMsg = result.error ?? "Erreur inconnue";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true, pokemonName };
    } catch (err) {
      const errorMessage = "Une erreur est survenue lors de la sélection";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSelecting(false);
    }
  }, [userId]);

  const handleSetTrainerName = useCallback(async (
    trainerName: string
  ): Promise<TrainerNameResult> => {
    setIsSelecting(true);
    setError(null);

    try {
      const result = await setTrainerName(userId, trainerName);

      if (!result.success) {
        setError(result.error);
        return result;
      }

      return { success: true };
    } catch (err) {
      const errorMessage = "Une erreur est survenue";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSelecting(false);
    }
  }, [userId]);

  return {
    handleSelectStarter,
    handleSetTrainerName,
    isSelecting,
    error,
  };
}