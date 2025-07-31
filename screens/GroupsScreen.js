import React, { useContext, useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, TouchableWithoutFeedback, Modal,
  TextInput, Platform, StatusBar, Keyboard, Dimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupsContext } from '../contexts/GroupsContext'
import FabAdd from '../components/FabAdd'
import BottomCurvedBar from '../components/BottomCurvedBar'
import { theme } from '../theme'

const ORDER_OPTIONS = [
  { label: 'A‑Z',        value: 'az'     },
  { label: 'Z‑A',        value: 'za'     },
  { label: 'Más nuevos', value: 'newest' },
  { label: 'Más viejos', value: 'oldest' },
]

const FAB_SIZE   = 64
const SVG_BASE_W = 298.74
const TARGET_H   = 130
const { width }  = Dimensions.get('window')
const BAR_HEIGHT = TARGET_H * (width / SVG_BASE_W)
const ICON_SIZE  = 28

export default function GroupsScreen({ navigation }) {
  const insets         = useSafeAreaInsets()
  const bottomBarH     = BAR_HEIGHT + insets.bottom
  const fabBottom      = insets.bottom + (BAR_HEIGHT - FAB_SIZE/2)
  const { groups, addGroup, updateGroup, removeGroup } = useContext(GroupsContext)

  // estados de búsqueda, orden y modales...
  const [isSearching, setIsSearching]           = useState(false)
  const [searchQuery, setSearchQuery]           = useState('')
  const [orderModalVisible, setOrderModalVisible] = useState(false)
  const [order, setOrder]                       = useState('az')
  const [modalVisible, setModalVisible]         = useState(false)
  const [modalMode, setModalMode]               = useState('add')
  const [newGroup, setNewGroup]                 = useState('')
  const [selectedGroupId, setSelectedGroupId]   = useState(null)
  const [menuVisible, setMenuVisible]           = useState(false)
  const [menuGroup, setMenuGroup]               = useState(null)

  // lógica de apertura de modales, handlers y filtrado…
  const filtered = useMemo(() => {
    let list = [...groups]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(g => g.name.toLowerCase().includes(q))
    }
    if      (order==='az')     list.sort((a,b)=>a.name.localeCompare(b.name))
    else if (order==='za')     list.sort((a,b)=>b.name.localeCompare(a.name))
    else if (order==='newest') list.sort((a,b)=>parseInt(b.id)-parseInt(a.id))
    else                       list.sort((a,b)=>parseInt(a.id)-parseInt(b.id))
    return list
  }, [groups, searchQuery, order])

  // Funciones para submit, menú contextual, etc.

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        {isSearching ? (
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar grupos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
        ) : (
          <Text style={styles.title}>GRUPOS</Text>
        )}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => {
            if (isSearching) setSearchQuery('')
            setIsSearching(v=>!v)
          }}>
            <Ionicons name={isSearching ? "close" : "search"} size={ICON_SIZE} color={theme.colors.surface}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={()=>setOrderModalVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={ICON_SIZE} color={theme.colors.surface}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          ...styles.scrollContent,
          paddingBottom: theme.spacing.lg + bottomBarH + FAB_SIZE*0.75
        }}
      >
        {filtered.length ? filtered.map((g,i)=>(
          <TouchableOpacity
            key={g.id}
            style={[styles.card, i===0 && styles.firstCard]}
            onPress={()=>navigation.navigate('Names',{ groupId:g.id, groupName:g.name })}
            onLongPress={()=>{ setMenuGroup(g); setMenuVisible(true) }}
            activeOpacity={0.85}
          >
            <Text style={styles.groupName}>{g.name}</Text>
            <TouchableOpacity style={styles.cardMenuBtn} onPress={()=>{ setMenuGroup(g); setMenuVisible(true) }}>
              <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.muted}/>
            </TouchableOpacity>
          </TouchableOpacity>
        )) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {searchQuery ? "No hay grupos que coincidan" : "Agregá tu primer grupo"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM BAR + FAB */}
      <BottomCurvedBar height={bottomBarH} style={styles.bottomBar}/>
      <FabAdd
        onPress={()=>{ setModalMode('add'); setNewGroup(''); setSelectedGroupId(null); setModalVisible(true) }}
        style={{
          position:'absolute',
          left: width/2 - FAB_SIZE/2,
          bottom: fabBottom,
          zIndex:20
        }}
      />

      {/* Modal Añadir/Editar Grupo */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={()=>setModalVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {modalMode==='add' ? 'Nuevo grupo' : 'Editar grupo'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del grupo"
                  value={newGroup}
                  onChangeText={setNewGroup}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    const t = newGroup.trim()
                    if (!t) return
                    if (modalMode==='add') addGroup({ name:t })
                    else updateGroup(selectedGroupId, t)
                    setModalVisible(false)
                    setNewGroup('')
                    Keyboard.dismiss()
                  }}
                />
                <TouchableOpacity style={styles.addBtn} onPress={()=>{
                    const t = newGroup.trim()
                    if (!t) return
                    if (modalMode==='add') addGroup({ name:t })
                    else updateGroup(selectedGroupId, t)
                    setModalVisible(false)
                    setNewGroup('')
                    Keyboard.dismiss()
                  }}
                >
                  <Ionicons name="add" size={ICON_SIZE} color={theme.colors.surface}/>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Menú Grupo */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={()=>setMenuVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Opciones</Text>
                <Text style={styles.menuSubtitle}>"{menuGroup?.name}"</Text>
                <View style={styles.menuActions}>
                  <TouchableOpacity onPress={()=>{
                      setModalMode('edit')
                      setSelectedGroupId(menuGroup.id)
                      setNewGroup(menuGroup.name)
                      setMenuVisible(false)
                      setModalVisible(true)
                    }}
                  >
                    <Text style={styles.menuActionText}>EDITAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{
                      removeGroup(menuGroup.id)
                      setMenuVisible(false)
                    }}
                  >
                    <Text style={[styles.menuActionText,styles.menuDeleteText]}>ELIMINAR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Orden */}
      <Modal visible={orderModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={()=>setOrderModalVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={styles.orderModalContent}>
                <Text style={styles.orderTitle}>Ordenar por:</Text>
                {ORDER_OPTIONS.map(opt=>(
                  <TouchableOpacity
                    key={opt.value}
                    style={[ styles.orderOption, order===opt.value && styles.orderOptionActive ]}
                    onPress={()=>{
                      setOrder(opt.value)
                      setOrderModalVisible(false)
                    }}
                  >
                    <Text style={[
                      styles.orderOptionText,
                      order===opt.value && styles.orderOptionTextActive
                    ]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor: theme.colors.background },
  header:       {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS==='android'
      ? (StatusBar.currentHeight||0)+25 : 25,
    paddingBottom:15, backgroundColor: theme.colors.primary,
  },
  headerBtn:    { width: ICON_SIZE + theme.spacing.sm, alignItems:'center' },
  title:        { flex:1, textAlign:'center', fontSize:theme.fontSize.lg, fontWeight:'bold', color:theme.colors.surface },
  searchInput:  { flex:1, height:36, backgroundColor:'#fff', borderRadius:theme.borderRadius.sm, paddingHorizontal:12 },
  headerRight:  { flexDirection:'row', alignItems:'center' },

  scroll:        { flex:1 },
  scrollContent: { paddingHorizontal:theme.spacing.md },

  card:          {
    flexDirection:'row', alignItems:'center',
    backgroundColor:theme.colors.card, padding:theme.spacing.md,
    borderRadius:theme.borderRadius.md, marginBottom:theme.spacing.md,
    shadowColor:'#000', shadowOpacity:0.05,
    shadowOffset:{width:0,height:2}, shadowRadius:2, elevation:2,
  },
  firstCard:     { marginTop:25 },
  groupName:     { flex:1, fontWeight:'bold', fontSize:theme.fontSize.md, color:theme.colors.text },
  cardMenuBtn:   { padding:4 },

  emptyBox:      { flex:1, alignItems:'center', justifyContent:'center', marginTop:40 },
  emptyText:     { color:theme.colors.muted, fontStyle:'italic', opacity:0.7 },

  bottomBar:     { position:'absolute', bottom:-2.5, left:0, right:0 },

  modalBg:       { flex:1, backgroundColor:'#0008', justifyContent:'center', alignItems:'center' },
  modalContent:  {
    width:'85%', backgroundColor:'#fff',
    borderRadius:theme.borderRadius.md,
    padding:theme.spacing.lg, alignItems:'center',
  },
  modalTitle:    { fontWeight:'bold', marginBottom:10 },
  input:         {
    width:'100%', borderWidth:1, borderColor:theme.colors.muted,
    borderRadius:theme.borderRadius.sm, padding:10, marginBottom:20,
  },
  addBtn:        {
    width:FAB_SIZE, height:FAB_SIZE, borderRadius:FAB_SIZE/2,
    backgroundColor:theme.colors.primary,
    justifyContent:'center', alignItems:'center',
  },
  menuContent:   {
    width:'80%', backgroundColor:'#fff',
    borderRadius:theme.borderRadius.md, padding:theme.spacing.lg,
    alignItems:'center',
  },
  menuTitle:     { fontWeight:'bold', fontSize:theme.fontSize.md, marginBottom:8 },
  menuSubtitle:  { color:theme.colors.muted, marginBottom:12, textAlign:'center' },
  menuActions:   { flexDirection:'row', justifyContent:'space-around', width:'100%' },
  menuActionText:{ fontWeight:'bold', fontSize:theme.fontSize.md, color:theme.colors.primary },
  menuDeleteText:{ color:'#d00' },
  orderModalContent:{
    width:'70%', backgroundColor:'#fff',
    borderRadius:theme.borderRadius.md, padding:theme.spacing.lg,
  },
  orderTitle:        { fontWeight:'bold', marginBottom:12, fontSize:theme.fontSize.md },
  orderOption:       { paddingVertical:10, paddingHorizontal:14, borderRadius:8, marginBottom:5 },
  orderOptionActive: { backgroundColor:theme.colors.primary },
  orderOptionText:   { fontSize:theme.fontSize.md },
  orderOptionTextActive:{ color:'#fff', fontWeight:'bold' },
})
