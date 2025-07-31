import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const GroupsContext = createContext()

export function GroupsProvider({ children }) {
  const STORAGE_KEY = '@myapp:groups'
  const [groups, setGroups] = useState([])

  // carga inicial
  useEffect(() => {
    ;(async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY)
      if (json) setGroups(JSON.parse(json))
    })()
  }, [])

  // guarda en cada cambio
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
  }, [groups])

  const addGroup            = g  => setGroups(prev => [...prev, { id: g.id||Date.now().toString(), name: g.name, names: g.names||[] }])
  const updateGroup         = (id,name) => setGroups(prev => prev.map(g => g.id===id ? { ...g, name } : g))
  const removeGroup         = id => setGroups(prev => prev.filter(g => g.id !== id))
  const addNameToGroup      = (groupId, person) => setGroups(prev => prev.map(g => g.id===groupId ? { ...g, names: [...g.names, person] } : g))
  const editNameInGroup     = (groupId,oldName,upd) => setGroups(prev => prev.map(g => g.id===groupId
    ? { ...g, names: g.names.map(n => n.name===oldName ? { ...n, ...upd } : n) }
    : g
  ))
  const removeNameFromGroup = (groupId,nameToRemove) => setGroups(prev => prev.map(g => g.id===groupId
    ? { ...g, names: g.names.filter(n => n.name !== nameToRemove) }
    : g
  ))

  return (
    <GroupsContext.Provider value={{
      groups,
      addGroup, updateGroup, removeGroup,
      addNameToGroup, editNameInGroup, removeNameFromGroup
    }}>
      {children}
    </GroupsContext.Provider>
  )
}
