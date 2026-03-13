const STORAGE_KEY = 'ai_literacy_data';
const API_KEY_STORAGE = 'gemini_api_key';

export function saveApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function loadApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { students: [], testInfo: { name: 'AI 리터러시 테스트', maxScore: 100 } };
  } catch {
    return { students: [], testInfo: { name: 'AI 리터러시 테스트', maxScore: 100 } };
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
