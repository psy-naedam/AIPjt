import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// 1단계(Sprint 1) 과제: Firebase 연동
// 발급받은 Firebase 인증 정보를 아래에 입력해야 합니다.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 나중에 Auth나 DB 등을 사용할 때 아래를 활성화합니다.
// export const auth = getAuth(app);
// export const db = getFirestore(app);

export default app;
