import { useEffect, useRef } from "react";

// Este hook ejecuta una función a intervalos regulares.
export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>(() => {});

  // Guardar la función callback en un ref para que no se pierda en cada renderizado
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // SetInterval
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id); // Limpiar el intervalo al desmontar el componente
    }
  }, [delay]);
}
