import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchEvents, fetchTodos } from '../services/dbService';

const FamilyContext = createContext();

export const useFamily = () => useContext(FamilyContext);

export const FamilyProvider = ({ children }) => {
  // 현재 접속한 가족 그룹 ID (임시: 'family_123')
  const [familyId, setFamilyId] = useState('family_123');
  
  // 상태 관리
  const [events, setEvents] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터 로딩 (초기 접속 시)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const fetchedEvents = await fetchEvents(familyId);
        const fetchedTodos = await fetchTodos(familyId);
        setEvents(fetchedEvents);
        setTodos(fetchedTodos);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (familyId) {
      loadData();
    }
  }, [familyId]);

  return (
    <FamilyContext.Provider value={{ familyId, events, setEvents, todos, setTodos, loading }}>
      {children}
    </FamilyContext.Provider>
  );
};
