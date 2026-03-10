import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

import { useFamily } from '../../store/FamilyContext';
import { updateTodoStatus, addTodo, deleteTodo, updateTodo } from '../../services/dbService';

// 한국어 달력 설정
LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

export default function HomeScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [showTodo, setShowTodo] = useState(true); // 첫 로딩 시 리스트가 보이도록 true로 변경
  const [newTodoTitle, setNewTodoTitle] = useState(''); // 새 할 일 입력 상태
  const [editingTodoId, setEditingTodoId] = useState(null); // 현재 편집 중인 Todo ID
  const [editingTodoTitle, setEditingTodoTitle] = useState(''); // 현재 편집 중인 내용
  const { events, loading, familyId, todos, setTodos } = useFamily();

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
      assignee: '우리 가족' // 기본값
    };

    try {
      const newId = await addTodo(familyId, newTodo);
      setTodos([{ ...newTodo, id: newId }, ...todos]);
      setNewTodoTitle('');
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
    <View style={styles.todoItemWrapper}>
      <TouchableOpacity 
        style={[styles.todoItem, item.isCompleted && styles.todoItemCompleted]} 
        onPress={() => toggleTodo(item.id, item.isCompleted)}
        onLongPress={() => startEditing(item)} // 길게 누르면 수정 모드
        activeOpacity={0.7}
      >
        <View style={styles.todoRow}>
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
            <Text style={[styles.todoTitle, item.isCompleted && styles.todoTextCompleted]}>
              {item.title}
            </Text>
          )}
        </View>
        <View style={styles.assigneeBadge}>
          <Text style={styles.assigneeText}>{item.assignee}</Text>
        </View>
      </TouchableOpacity>
      
      {/* 삭제 버튼 추가 */}
      <TouchableOpacity onPress={() => handleDeleteTodo(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEventItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.eventItem}
      onPress={() => navigation.navigate('Schedule', { editEvent: item })}
      activeOpacity={0.7}
    >
      <View style={[styles.eventDot, { backgroundColor: item.color || COLORS.primary }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>{item.date}</Text>
      </View>
      {item.member && (
        <View style={styles.assigneeBadge}>
          <Text style={styles.assigneeText}>{item.member}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // 전역 속성(events)을 캘린더 markedDates 형식에 맞게 변환
  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = { marked: true, dotColor: event.color };
    return acc;
  }, {});
  
  // 현재 선택된 날짜 하이라이트 추가
  if (selectedDate) {
    markedDates[selectedDate] = { 
      ...markedDates[selectedDate], 
      selected: true, 
      disableTouchEvent: true, 
      selectedColor: COLORS.secondary 
    };
  }

  return (
    <View style={styles.container}>
      {/* 왼쪽: 액션 버튼 영역 (기존 오른쪽) */}
      <View style={styles.rightPanel}>
        <ScrollView 
          style={styles.actionScrollView}
          contentContainerStyle={styles.actionContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => navigation.navigate('Schedule', { date: selectedDate })}
          >
            <Text style={styles.addButtonText}>+ 가족 일정 추가</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
             style={[styles.addButton, { backgroundColor: COLORS.tertiary, marginTop: 12 }]} 
             onPress={() => setShowTodo(!showTodo)}
          >
             <Text style={styles.addButtonText}>{showTodo ? '목록 닫기' : '모든 일정 및 할 일 확인'}</Text>
          </TouchableOpacity>
          
          {showTodo && (
            <View style={{ width: '100%', marginTop: 15 }}>
              {events.length > 0 && (
                <View style={styles.listSection}>
                  <Text style={styles.sectionTitle}>📅 다가오는 가족 일정</Text>
                  {events.map((event) => renderEventItem(event))}
                </View>
              )}
              
              {todos.length >= 0 && (
                <View style={styles.listSection}>
                  <Text style={styles.sectionTitle}>✅ 가족 할 일 목록</Text>
                  
                  {/* 신규 할 일 입력창 */}
                  <View style={styles.todoInputContainer}>
                    <TextInput
                      style={styles.todoInput}
                      placeholder="새로운 할 일을 입력하세요"
                      value={newTodoTitle}
                      onChangeText={setNewTodoTitle}
                      onSubmitEditing={handleAddTodo}
                    />
                    <TouchableOpacity style={styles.todoAddBtn} onPress={handleAddTodo}>
                      <Text style={styles.todoAddBtnText}>추가</Text>
                    </TouchableOpacity>
                  </View>

                  {todos.map((todo) => renderTodoItem({ item: todo }))}
                </View>
              )}

              {events.length === 0 && todos.length === 0 && (
                <Text style={{ textAlign: 'center', color: COLORS.lightText, marginTop: 20 }}>
                  등록된 일정이나 할 일이 없습니다.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* 오른쪽: 달력 영역 (기존 왼쪽) */}
      <View style={styles.leftPanel}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: COLORS.white,
              calendarBackground: COLORS.white,
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: COLORS.secondary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: COLORS.primary,
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: COLORS.primary,
              selectedDotColor: '#ffffff',
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.text,
              textDayFontFamily: 'sans-serif',
              textMonthFontFamily: 'sans-serif',
              textDayHeaderFontFamily: 'sans-serif',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // 가로 방향으로 레이아웃 분할
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  leftPanel: {
    flex: 3, // 달력 영역 비율 확대 (새로운 비율 1:3)
    paddingLeft: 15, // 왼쪽 사이드바와의 간격을 위해 paddingLeft로 수정
  },
  rightPanel: {
    flex: 1, // 버튼 및 리스트 영역 비율 축소
    justifyContent: 'flex-start',
  },
  actionScrollView: {
    flex: 1,
    width: '100%',
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    padding: 10,
    ...SHADOWS.light,
  },
  actionContainer: {
    // 내부 정렬은 기존(왼쪽 정렬) 유지
    alignItems: 'flex-start', 
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 20, 
    borderRadius: SIZES.radius,
    alignItems: 'center',
    width: '100%', // 패널 너비에 맞춤
    ...SHADOWS.light,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  },
  todoItem: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.light,
    width: '100%',
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
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
  },
  todoTitle: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.lightText,
  },
  assigneeBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  assigneeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  listSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  eventItem: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.light,
    width: '100%',
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 4,
  },
  todoItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 10,
    marginLeft: 5,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  todoInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  todoInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginRight: 8,
  },
  todoAddBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: SIZES.radius,
  },
  todoAddBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  todoEditInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  }
});
