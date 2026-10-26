import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'carnet-dy-v1';
const Ctx = createContext(null);

// Toutes les données vivent dans un seul objet : { programme, settings, 'd-AAAA-MM-JJ': {...}, 'w-AAAA-MM-JJ': {...} }
export function StoreProvider({ children }) {
  const ref = useRef({});
  const [ready, setReady] = useState(false);
  const [, setV] = useState(0);
  const timer = useRef(null);

  const save = useCallback(() => {
    clearTimeout(timer.current);
    return AsyncStorage.setItem(KEY, JSON.stringify(ref.current)).catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        try {
          ref.current = raw ? JSON.parse(raw) || {} : {};
        } catch (e) {
          ref.current = {};
        }
      })
      .finally(() => setReady(true));
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') save();
    });
    return () => sub.remove();
  }, [save]);

  // fn reçoit l'objet de données et le modifie directement ; on rafraîchit puis on enregistre.
  const update = useCallback(
    (fn) => {
      fn(ref.current);
      setV((v) => v + 1);
      clearTimeout(timer.current);
      timer.current = setTimeout(save, 400);
    },
    [save]
  );

  const replaceAll = useCallback(
    (data) => {
      ref.current = data || {};
      setV((v) => v + 1);
      save();
    },
    [save]
  );

  return (
    <Ctx.Provider value={{ D: ref.current, update, replaceAll, ready }}>{children}</Ctx.Provider>
  );
}

export const useStore = () => useContext(Ctx);
