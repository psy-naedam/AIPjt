import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useFamily } from '../../store/FamilyContext';
import { addEvent, updateEvent } from '../../services/dbService';

export default function ScheduleScreen({ route, navigation }) {
  // route.params에 editEvent가 넘어오면 '수정 모드'로 동작
  const editModeParams = route.params?.editEvent || null;
  const isEditMode = !!editModeParams;

  const [title, setTitle] = useState(isEditMode ? editModeParams.title : '');
  const [date, setDate] = useState(isEditMode ? editModeParams.date : (route.params?.date || ''));
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(isEditMode ? (editModeParams.member || '') : ''); 

  const members = ['아빠', '엄마', '재인', '재이']; 

  const { familyId, events, setEvents } = useFamily();
  
  const handleSave = async () => {
    if (!title || !date || !selectedMember) {
      alert('일정 제목, 날짜, 그리고 담당 가족 구성원을 모두 선택해주세요.');
      return;
    }

    const newEvent = {
       title,
       date,
       member: selectedMember,
       color: COLORS.primary 
    };

    try {
      if (isEditMode) {
        // 기존 일정 수정 (DB 연동)
        await updateEvent(familyId, editModeParams.id, newEvent);
        // 전역 상태의 events 배열 내 해당 일정 업데이트
        setEvents(events.map(ev => ev.id === editModeParams.id ? { ...ev, ...newEvent } : ev));
        alert(`일정이 성공적으로 수정되었습니다!`);
      } else {
        // 신규 추가 (DB 연동)
        const newId = await addEvent(familyId, newEvent);
        setEvents([...events, { ...newEvent, id: newId }]);
        alert(`일정 '${title}'이(가) 저장되었습니다!`);
      }
      navigation.goBack();
    } catch (error) {
       console.error("일정 저장 실패", error);
       alert("일정을 저장하는 데 실패했습니다.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>{isEditMode ? '가족 일정 수정' : '가족 일정 추가'}</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>일정 제목</Text>
        <TextInput 
          style={styles.input} 
          placeholder="예: 가족 저녁 식사" 
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>날짜 선택</Text>
        
        {/* 날짜 선택 터치 영역 */}
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setCalendarVisible(true)}
        >
          <Text style={{ color: date ? COLORS.text : COLORS.lightText }}>
            {date ? date : '날짜를 선택해 주세요'}
          </Text>
        </TouchableOpacity>

        {/* 팝업 형태의 달력 모달 */}
        <Modal
          visible={isCalendarVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setCalendarVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.calendarWrapper}>
                <Calendar
                  current={date || undefined}
                  onDayPress={(day) => {
                    setDate(day.dateString);
                    setCalendarVisible(false); // 선택 시 팝업 닫기
                  }}
                  markedDates={{
                    [date]: { 
                      selected: true, 
                      disableTouchEvent: true, 
                      selectedColor: COLORS.secondary 
                    }
                  }}
                  theme={{
                    backgroundColor: COLORS.white,
                    calendarBackground: COLORS.white,
                    selectedDayBackgroundColor: COLORS.secondary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: COLORS.primary,
                    dayTextColor: '#2d4150',
                    arrowColor: COLORS.primary,
                    textDayFontFamily: 'sans-serif',
                    textMonthFontFamily: 'sans-serif',
                    textDayHeaderFontFamily: 'sans-serif',
                  }}
                />
              </View>
              <TouchableOpacity 
                style={styles.closeModalButton} 
                onPress={() => setCalendarVisible(false)}
              >
                <Text style={styles.closeModalText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text style={styles.label}>가족 구성원 선택</Text>
        <View style={styles.memberContainer}>
          {members.map((item) => (
            <TouchableOpacity 
              key={item}
              style={[
                styles.memberButton, 
                selectedMember === item && styles.memberButtonSelected
              ]}
              onPress={() => setSelectedMember(item)}
            >
              <Text 
                style={[
                  styles.memberText, 
                  selectedMember === item && styles.memberTextSelected
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{isEditMode ? '일정 수정하기' : '일정 저장하기'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  label: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: SIZES.radius,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  calendarWrapper: {
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 배경
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    ...SHADOWS.light,
  },
  closeModalButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
  },
  closeModalText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 5,
  },
  memberButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  memberButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  memberText: {
    fontSize: SIZES.body4,
    color: COLORS.lightText,
    fontWeight: '600',
  },
  memberTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 10,
    ...SHADOWS.light,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
