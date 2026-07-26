import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hook d'aide pour détecter l'état monté côté client sans créer d'effet ni de mismatch SSR.
 */
export function useHasMounted(): boolean {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );
}
