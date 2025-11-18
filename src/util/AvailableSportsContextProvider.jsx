import { useState } from "react";
import { AvailableSportsContext } from "./availableSportsContext";

export const AvailableSportsContextProvider = ({ children }) => {
  const [availableSports, setAvailableSports] = useState([]);

  const updateAvailableSports = (newValue) => {
    setAvailableSports(newValue);
  };

  return (
    <AvailableSportsContext.Provider
      value={{ availableSports, updateAvailableSports }}
    >
      {children}
    </AvailableSportsContext.Provider>
  );
};
