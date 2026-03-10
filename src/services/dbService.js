import { app } from './firebase'; // 초기화된 앱 인스턴스
// 추후 실제 DB 연결 시 활성화
// import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

// const db = getFirestore(app);

/* 
  일정 관리 (Events CRUD) 목업 로직
  나중에 Firebase Firestore로 교체 
*/
export const fetchEvents = async (familyId) => {
  console.log(`[API] ${familyId}의 가족 일정 불러오기`);
  // mock data
  return [
    { id: 'e1', title: '엄마 생일', date: '2026-03-12', color: '#FFA69E' },
    { id: 'e2', title: '가족 외식', date: '2026-03-15', color: '#5C9EAD' },
  ];
};

export const addEvent = async (familyId, eventData) => {
  console.log(`[API] 일정 추가:`, eventData);
  // const docRef = await addDoc(collection(db, `families/${familyId}/events`), eventData);
  // return docRef.id;
  return 'new_event_' + Date.now();
};

export const updateEvent = async (familyId, eventId, eventData) => {
  console.log(`[API] 일정 수정:`, eventId, eventData);
  // const eventRef = doc(db, `families/${familyId}/events`, eventId);
  // await updateDoc(eventRef, eventData);
};

/* 
  할 일 관리 (Todos CRUD) 목업 로직
  나중에 Firebase Firestore로 교체 
*/
export const fetchTodos = async (familyId) => {
  console.log(`[API] ${familyId}의 가족 할 일 불러오기`);
  // mock data
  return [
    { id: 't1', title: '거실 청소', isCompleted: false, assignee: '아빠' },
  ];
};

export const updateTodoStatus = async (familyId, todoId, isCompleted) => {
  console.log(`[API] 할 일 상태 변경: ${todoId} -> ${isCompleted}`);
  // const todoRef = doc(db, `families/${familyId}/todos`, todoId);
  // await updateDoc(todoRef, { isCompleted });
};

export const addTodo = async (familyId, todoData) => {
  console.log(`[API] 할 일 추가:`, todoData);
  // const docRef = await addDoc(collection(db, `families/${familyId}/todos`), todoData);
  // return docRef.id;
  return 'new_todo_' + Date.now();
};

export const deleteTodo = async (familyId, todoId) => {
  console.log(`[API] 할 일 삭제: ${todoId}`);
  // const todoRef = doc(db, `families/${familyId}/todos`, todoId);
  // await deleteDoc(todoRef);
};

export const updateTodo = async (familyId, todoId, todoData) => {
  console.log(`[API] 할 일 수정: ${todoId}`, todoData);
  // const todoRef = doc(db, `families/${familyId}/todos`, todoId);
  // await updateDoc(todoRef, todoData);
};
