import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useFamily } from '../../store/FamilyContext';
import { updateTodoStatus, addTodo, deleteTodo, updateTodo } from '../../services/dbService';

export default function TodoScreen({ navigation }) {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoMember, setNewTodoMember] = useState('가족 공통');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodoTitle, setEditingTodoTitle] = useState('');
  
  const members = ['가족 공통', '아빠', '엄마', '재인', '재이'];
  const { familyId, todos, setTodos } = useFamily();

  const toggleTodo = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, isCompleted: newStatus } : todo
    ));
    
    try {
      await updateTodoStatus(familyId, id, newStatus);
    } catch (error) {
       console.error("Todo 상태 업데이트 실패", error);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;
    
    const newTodo = {
      title: newTodoTitle,
      isCompleted: false,
      assignee: newTodoMember
    };

    try {
      const newId = await addTodo(familyId, newTodo);
      setTodos([{ ...newTodo, id: newId }, ...todos]);
      setNewTodoTitle('');
      setNewTodoMember('가족 공통');
    } catch (error) {
      console.error("Todo 추가 실패", error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(familyId, id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("Todo 삭제 실패", error);
    }
  };

  const startEditing = (todo) => {
    setEditingTodoId(todo.id);
    setEditingTodoTitle(todo.title);
  };

  const handleUpdateTodo = async () => {
    if (!editingTodoId || !editingTodoTitle.trim()) {
      setEditingTodoId(null);
      return;
    }

    const updatedTodo = { title: editingTodoTitle };
    
    try {
      await updateTodo(familyId, editingTodoId, updatedTodo);
      setTodos(todos.map(todo => 
        todo.id === editingTodoId ? { ...todo, title: editingTodoTitle } : todo
      ));
      setEditingTodoId(null);
    } catch (error) {
      console.error("Todo 수정 실패", error);
    }
  };

  const renderTodoItem = ({ item }) => (
    <View style={[styles.todoItem, item.isCompleted && styles.todoItemCompleted]}>
      <TouchableOpacity 
        style={styles.todoRow} 
        onPress={() => toggleTodo(item.id, item.isCompleted)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, item.isCompleted && styles.checkboxActive]} />
        
        {editingTodoId === item.id ? (
          <TextInput
            style={styles.todoEditInput}
            value={editingTodoTitle}
            onChangeText={setEditingTodoTitle}
            onBlur={handleUpdateTodo}
            onSubmitEditing={handleUpdateTodo}
            autoFocus
          />
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={[styles.todoTitle, item.isCompleted && styles.todoTextCompleted]}>
              {item.title}
            </Text>
            <Text style={styles.todoMemberText}>{item.assignee}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.todoActionButtons}>
        <TouchableOpacity onPress={() => startEditing(item)} style={styles.iconButton}>
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTodo(item.id)} style={styles.iconButton}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>가족 할 일 목록</Text>
      
      {/* 할 일 추가 섹션 */}
      <View style={styles.addSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberSelector}>
          {members.map(member => (
            <TouchableOpacity 
              key={member} 
              style={[styles.memberTab, newTodoMember === member && styles.memberTabActive]}
              onPress={() => setNewTodoMember(member)}
            >
              <Text style={[styles.memberTabText, newTodoMember === member && styles.memberTabTextActive]}>
                {member}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.todoInput}
            placeholder={`${newTodoMember}의 할 일 입력`}
            value={newTodoTitle}
            onChangeText={setNewTodoTitle}
            onSubmitEditing={handleAddTodo}
          />
          <TouchableOpacity style={styles.todoAddBtn} onPress={handleAddTodo}>
            <Text style={styles.todoAddBtnText}>추가</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  todoItem: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  todoItemCompleted: {
    opacity: 0.6,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
  },
  todoTitle: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.lightText,
  },
  todoMemberText: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 2,
    fontWeight: '500',
  },
  todoActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  editIcon: {
    fontSize: 18,
    color: COLORS.primary,
  },
  deleteIcon: {
    fontSize: 18,
    color: '#FF6B6B',
  },
  addSection: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    ...SHADOWS.light,
  },
  memberSelector: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  memberTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  memberTabActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  memberTabText: {
    fontSize: 13,
    color: COLORS.lightText,
    fontWeight: '600',
  },
  memberTabTextActive: {
    color: COLORS.white,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoInput: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginRight: 10,
    fontSize: 15,
  },
  todoAddBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    height: 45,
    justifyContent: 'center',
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  todoAddBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  todoEditInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  }
});
