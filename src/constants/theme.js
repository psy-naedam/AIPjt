// src/constants/theme.js

export const COLORS = {
  // 가족 친화적이고 따뜻한 스타일 (Design & Style) 가이드 반영
  primary: '#FFA69E',     // 코랄 핑크 - 주조색, 따뜻함
  secondary: '#FFD166',   // 웜 옐로우 - 포인트, 활기
  tertiary: '#06D6A0',    // 소프트 그린 - 안정감
  background: '#FFF9F2',  // 베이지 톤 - 배색 배경, 눈이 편안함
  text: '#333333',        // 진한 회색 텍스트
  lightText: '#888888',
  white: '#FFFFFF',
  
  // 가족 구성원 초기 지정 테마 색상 (예시)
  familyColors: {
    mom: '#FFA69E',       // 핑크
    dad: '#5C9EAD',       // 부드러운 블루
    child1: '#06D6A0',    // 그린
    child2: '#FFD166',    // 옐로우
  }
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  largeTitle: 32,
  h1: 24,
  h2: 20,
  h3: 18,
  h4: 16,
  body1: 24,
  body2: 20,
  body3: 16,
  body4: 14,
};

// 둥글고 부드러운 테마 및 UI 요소에 재사용
export const SHADOWS = {
  light: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
};
