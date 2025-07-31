// screens/NamesScreen.js

import React, { useContext, useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
  Platform,
  StatusBar,
  Keyboard,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupsContext } from '../contexts/GroupsContext'
import BottomCurvedBar from '../components/BottomCurvedBar'
import FabAdd from '../components/FabAdd'
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
const GAP_BOTTOM = 80

export default function NamesScreen({ route, navigation }) {
  const { groupId, groupName } = route.params
  const insets     = useSafeAreaInsets()
  const bottomBarH = BAR_HEIGHT + insets.bottom
  const fabBottom  = insets.bottom + (BAR_HEIGHT - FAB_SIZE/2)

  const { groups, addNameToGroup, editNameInGroup, removeNameFromGroup } = useContext(GroupsContext)
  const group = groups.find(g => g.id === groupId) || { names: [] }

  // Buscar + ordenar
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [order, setOrder]             = useState('az')
  const [orderModalVisible, setOrderModalVisible] = useState(false)

  // Añadir / editar persona
  const [modalVisible, setModalVisible]     = useState(false)
  const [modalMode, setModalMode]           = useState('add') // add | edit
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [newName, setNewName]               = useState('')
  const [newDesc, setNewDesc]               = useState('')

  // Menú contextual persona
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuPerson, setMenuPerson]   = useState(null)

  // Abrir modales
  const openSearch       = () => { setIsSearching(v=>!v); if (isSearching) setSearchQuery('') }
  const openAddModal     = () => { setModalMode('add'); setNewName(''); setNewDesc(''); setModalVisible(true) }
  const openEditModal    = p => { setModalMode('edit'); setSelectedPerson(p); setNewName(p.name); setNewDesc((p.description||[]).join('\n')); setModalVisible(true) }
  const openPersonMenu   = p => { setMenuPerson(p); setMenuVisible(true) }

  // Handlers
  const handleSubmit = () => {
    const name = newName.trim()
    if (!name) return
    const desc = newDesc.split('\n').map(l=>l.trim()).filter(Boolean)
    if (modalMode==='add') addNameToGroup(groupId, { name, description: desc, timestamp:Date.now() })
    else                  editNameInGroup(groupId, selectedPerson.name, { name, description: desc })
    setModalVisible(false)
    Keyboard.dismiss()
  }
  const handleDeletePerson = () => {
    removeNameFromGroup(groupId, menuPerson.name)
    setMenuVisible(false)
  }

  // Filtrar y ordenar lista
  const filtered = useMemo(() => {
    let list = [...(group.names||[])]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description||[]).some(line=>line.toLowerCase().includes(q))
      )
    }
    if      (order==='az')     list.sort((a,b)=>a.name.localeCompare(b.name))
    else if (order==='za')     list.sort((a,b)=>b.name.localeCompare(a.name))
    else if (order==='newest') list.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0))
    else                        list.sort((a,b)=>(a.timestamp||0)-(b.timestamp||0))
    return list
  }, [group.names, searchQuery, order])

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={()=>navigation.goBack()}>
          <Ionicons name="arrow-back" size={ICON_SIZE} color={theme.colors.surface}/>
        </TouchableOpacity>

        {isSearching ? (
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
        ) : (
          <Text style={styles.title}>{groupName}</Text>
        )}

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={openSearch}>
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
          paddingBottom: theme.spacing.lg + bottomBarH + FAB_SIZE*0.75,
        }}
      >
        {filtered.length > 0 ? filtered.map((p,i)=>(
          <TouchableOpacity
            key={p.name+i}
            style={[styles.card, i===0 && styles.firstCard]}
            activeOpacity={0.85}
            onPress={()=>openEditModal(p)}
          >
            <View style={{flex:1}}>
              <Text style={styles.personName}>{p.name}</Text>
              {(p.description||[]).length>0 && (
                <Text style={styles.personDesc}>{p.description.join('\n')}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.cardMenuBtn} onPress={()=>openPersonMenu(p)}>
              <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.muted}/>
            </TouchableOpacity>
          </TouchableOpacity>
        )) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No hay resultados</Text>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM BAR + FAB */}
      <BottomCurvedBar height={bottomBarH} style={styles.bottomBar}/>
      <FabAdd
        onPress={openAddModal}
        style={{
          position:'absolute',
          left: width/2 - FAB_SIZE/2,
          bottom: fabBottom,
          zIndex:20,
        }}
      />

      {/* MODAL Añadir/Editar */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={()=>setModalVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {modalMode==='add' ? 'NUEVA PERSONA' : 'EDITAR PERSONA'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  value={newName}
                  onChangeText={setNewName}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  autoFocus
                />
                <TextInput
                  style={[styles.input,{height:80}]}
                  placeholder="Descripción (una por línea)"
                  value={newDesc}
                  onChangeText={setNewDesc}
                  multiline
                />
                <FabAdd onPress={handleSubmit} style={{marginTop: theme.spacing.lg}}/>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL Opciones Persona */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={()=>setMenuVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Opciones</Text>
                <Text style={styles.menuSubtitle}>"{menuPerson?.name}"</Text>
                <View style={styles.menuActions}>
                  <TouchableOpacity onPress={()=>{
                    openEditModal(menuPerson)
                    setMenuVisible(false)
                  }}>
                    <Text style={styles.menuActionText}>EDITAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeletePerson}>
                    <Text style={[styles.menuActionText,styles.menuDeleteText]}>ELIMINAR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL Ordenar */}
      <Modal visible={orderModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={()=>setOrderModalVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={styles.orderModalContent}>
                <Text style={styles.orderTitle}>Ordenar por:</Text>
                {ORDER_OPTIONS.map(opt=>(
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.orderOption, order===opt.value && styles.orderOptionActive]}
                    onPress={()=>{ setOrder(opt.value); setOrderModalVisible(false) }}
                  >
                    <Text style={[
                      styles.orderOptionText,
                      order===opt.value && styles.orderOptionTextActive
                    ]}>
                      {opt.label}
                    </Text>
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
  container:     { flex:1, backgroundColor: theme.colors.background },
  header:        {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS==='android'
      ? (StatusBar.currentHeight||0)+25 : 25,
    paddingBottom:15, backgroundColor: theme.colors.primary,
  },
  headerBtn:     { width: ICON_SIZE + theme.spacing.sm, alignItems:'center' },
  title:         { flex:1, textAlign:'center', fontSize: theme.fontSize.lg, fontWeight:'bold', color:theme.colors.surface },
  searchInput:   {
    flex:1, height:36, backgroundColor:'#fff',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal:12,
  },
  headerRight:   {flexDirection:'row', alignItems:'center'},

  scroll:        { flex:1 },
  scrollContent: { paddingHorizontal: theme.spacing.md },

  card:          {
    flexDirection:'row', alignItems:'center',
    backgroundColor:theme.colors.card, padding:theme.spacing.md,
    borderRadius:theme.borderRadius.md, marginBottom:theme.spacing.md,
    shadowColor:'#000', shadowOpacity:0.05,
    shadowOffset:{width:0,height:2}, shadowRadius:2, elevation:2,
  },
  firstCard:     { marginTop:25 },
  personName:    { fontWeight:'bold', fontSize:theme.fontSize.md, color:theme.colors.text },
  personDesc:    { color:theme.colors.muted, marginTop:4 },
  cardMenuBtn:   { padding:4 },

  emptyBox:      { flex:1, alignItems:'center', justifyContent:'center', marginTop:40 },
  emptyText:     { color:theme.colors.muted, fontStyle:'italic', opacity:0.7 },

  bottomBar:     { position:'absolute', bottom:-2.5, left:0, right:0 },

  // Modal común centrado
  modalBg:       { flex:1, backgroundColor:'#0008', justifyContent:'center', alignItems:'center' },

  modalContent:  {
    width:'80%', backgroundColor:'#fff',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.lg + GAP_BOTTOM,
    alignItems:'center',
  },
  modalTitle:    { fontWeight:'bold', marginBottom: theme.spacing.md, textTransform:'uppercase' },
  input:         {
    width:'100%', borderWidth:1, borderColor:theme.colors.muted,
    borderRadius:theme.borderRadius.sm, padding:10, marginBottom:theme.spacing.md,
  },

  menuContent:   {
    width:'80%', backgroundColor:'#fff',
    borderRadius: theme.borderRadius.md, padding: theme.spacing.lg,
    alignItems:'center',
  },
  menuTitle:     { fontWeight:'bold', fontSize:theme.fontSize.md, marginBottom:8 },
  menuSubtitle:  { color:theme.colors.muted, marginBottom:12, textAlign:'center' },
  menuActions:   { flexDirection:'row', justifyContent:'space-around', width:'100%' },
  menuActionText:{ fontWeight:'bold', fontSize:theme.fontSize.md, color:theme.colors.primary },
  menuDeleteText:{ color:'#d00' },

  orderModalContent:{
    width:'70%', backgroundColor:'#fff',
    borderRadius: theme.borderRadius.md, padding: theme.spacing.lg,
  },
  orderTitle:        { fontWeight:'bold', marginBottom:12, fontSize:theme.fontSize.md },
  orderOption:       { paddingVertical:10, paddingHorizontal:14, borderRadius:8, marginBottom:5 },
  orderOptionActive: { backgroundColor:theme.colors.primary },
  orderOptionText:   { fontSize:theme.fontSize.md },
  orderOptionTextActive:{ color:'#fff', fontWeight:'bold' },
})
