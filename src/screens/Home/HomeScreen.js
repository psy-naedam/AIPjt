import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

import { useFamily } from '../../store/FamilyContext';
import { updateTodoStatus } from '../../services/dbService';

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
  const [showTodo, setShowTodo] = useState(false);
  const { events, loading, familyId, todos, setTodos } = useFamily();

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

  const renderEventItem = (item) => (
    <View key={item.id} style={styles.eventItem}>
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
    </View>
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
        <View style={styles.actionContainer}>
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
            <ScrollView style={{ width: '100%', marginTop: 15 }} showsVerticalScrollIndicator={false}>
              {events.length > 0 && (
                <View style={styles.listSection}>
                  <Text style={styles.sectionTitle}>📅 다가오는 가족 일정</Text>
                  {events.map((event) => renderEventItem(event))}
                </View>
              )}
              
              {todos.length > 0 && (
                <View style={styles.listSection}>
                  <Text style={styles.sectionTitle}>✅ 가족 할 일 목록</Text>
                  {todos.map((todo) => renderTodoItem({ item: todo }))}
                </View>
              )}

              {events.length === 0 && todos.length === 0 && (
                <Text style={{ textAlign: 'center', color: COLORS.lightText, marginTop: 20 }}>
                  등록된 일정이나 할 일이 없습니다.
                </Text>
              )}
            </ScrollView>
          )}
        </View>
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
    flex: 2, // 달력 영역이 화면의 2/3 정도를 차지하도록 비율 설정
    paddingRight: 15,
  },
  rightPanel: {
    flex: 1, // 버튼 영역이 화면의 1/3 비율을 차지하도록 설정
    justifyContent: 'flex-start',
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
  }
});
