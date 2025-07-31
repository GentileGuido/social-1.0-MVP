import React, { createContext, useContext } from 'react'
export const NamesContext = createContext()
export const useNames = () => useContext(NamesContext)
export function NamesProvider({ children }) {
  // Aquí podrías manejar datos globales de “names” si los necesitas,
  // pero si todo está en GroupsContext, simplemente lo dejas pasar:
  return (
    <NamesContext.Provider value={{}}>
      {children}
    </NamesContext.Provider>
  )
}
