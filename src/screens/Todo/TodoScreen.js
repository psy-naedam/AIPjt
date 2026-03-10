import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useFamily } from '../../store/FamilyContext';
import { updateTodoStatus } from '../../services/dbService';

export default function TodoScreen({ navigation }) {
  const { familyId, todos, setTodos } = useFamily();

  const toggleTodo = async (id, currentStatus) => {
    // UI 즉시 업데이트 (Optimistic Update)
    const newStatus = !currentStatus;
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, isCompleted: newStatus } : todo
    ));
    
    // DB 연동 호출
    try {
      await updateTodoStatus(familyId, id, newStatus);
    } catch (error) {
       console.error("Todo 상태 업데이트 실패", error);
       // 실패 시 롤백 로직 추가 가능
    }
  };

  const renderTodoItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.todoItem, item.isCompleted && styles.todoItemCompleted]} 
      onPress={() => toggleTodo(item.id, item.isCompleted)}
      activeOpacity={0.7}
    >
      <View style={styles.todoRow}>
        <View style={[styles.checkbox, item.isCompleted && styles.checkboxActive]} />
        <Text style={[styles.todoTitle, item.isCompleted && styles.todoTextCompleted]}>
          {item.title}
        </Text>
      </View>
      <View style={styles.assigneeBadge}>
        <Text style={styles.assigneeText}>{item.assignee}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>가족 할 일 목록</Text>
      
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
        contentContainerStyle={styles.listContainer}
      />
      
      <TouchableOpacity style={styles.addButton} onPress={() => alert('할 일 추가 모달 표시')}>
        <Text style={styles.addButtonText}>+ 할 일 추가</Text>
      </TouchableOpacity>
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
  assigneeBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  assigneeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: COLORS.tertiary,
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 10,
    ...SHADOWS.light,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
