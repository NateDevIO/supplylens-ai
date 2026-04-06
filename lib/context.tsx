"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import { type AppState, type AppAction } from "./types";
import { shipments } from "./mock-data";

const initialState: AppState = {
  shipments,
  activeScenario: null,
  impactData: null,
  selectedShipmentId: null,
  isShipmentTableOpen: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_SCENARIO":
      return { ...state, activeScenario: action.payload, impactData: null };
    case "SET_IMPACT_DATA":
      return { ...state, impactData: action.payload };
    case "SELECT_SHIPMENT":
      return { ...state, selectedShipmentId: action.payload };
    case "TOGGLE_SHIPMENT_TABLE":
      return {
        ...state,
        isShipmentTableOpen: action.payload ?? !state.isShipmentTableOpen,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}
