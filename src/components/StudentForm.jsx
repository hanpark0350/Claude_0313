import { useState } from 'react';
import { Plus, Trash2, UserPlus, X } from 'lucide-react';
import { generateId } from '../utils/storage';

const DEFAULT_SECTIONS = [
  { name: 'AI 개념 이해', maxScore: 25 },
  { name: 'AI 활용 능력', maxScore: 25 },
  { name: 'AI 윤리 인식', maxScore: 25 },
  { name: '비판적 사고', maxScore: 25 },
];

export default function StudentForm({ onAdd, onClose, editStudent }) {
  const [name, setName] = useState(editStudent?.name || '');
  const [grade, setGrade] = useState(editStudent?.grade || '');
  const [notes, setNotes] = useState(editStudent?.notes || '');
  const [sections, setSections] = useState(
    editStudent?.sections || DEFAULT_SECTIONS.map(s => ({ ...s, score: 0, id: generateId() }))
  );

  const totalScore = sections.reduce((sum, s) => sum + Number(s.score || 0), 0);
  const maxScore = sections.reduce((sum, s) => sum + Number(s.maxScore || 0), 0);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  function addSection() {
    setSections([...sections, { id: generateId(), name: '', score: 0, maxScore: 20 }]);
  }

  function removeSection(id) {
    setSections(sections.filter(s => s.id !== id));
  }

  function updateSection(id, field, value) {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: field === 'name' ? value : Number(value) } : s));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: editStudent?.id || generateId(),
      name: name.trim(),
      grade: grade.trim(),
      notes: notes.trim(),
      sections,
      totalScore,
      maxScore,
      createdAt: editStudent?.createdAt || new Date().toISOString(),
      feedback: editStudent?.feedback || null,
    });
  }

  function getGradeColor(pct) {
    if (pct >= 90) return 'text-emerald-600 bg-emerald-50';
    if (pct >= 75) return 'text-blue-600 bg-blue-50';
    if (pct >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  }

  function getGradeLabel(pct) {
    if (pct >= 90) return '우수';
    if (pct >= 75) return '양호';
    if (pct >= 60) return '보통';
    return '미흡';
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">
              {editStudent ? '학생 정보 수정' : '학생 추가'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 scrollbar-thin">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                학생 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="홍길동"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                학년/반
              </label>
              <input
                type="text"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                placeholder="예: 3학년 2반"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">영역별 점수</label>
              <button
                type="button"
                onClick={addSection}
                className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                영역 추가
              </button>
            </div>

            <div className="space-y-2">
              {sections.map(sec => (
                <div key={sec.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sec.name}
                    onChange={e => updateSection(sec.id, 'name', e.target.value)}
                    placeholder="영역명"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    value={sec.score}
                    onChange={e => updateSection(sec.id, 'score', e.target.value)}
                    min="0"
                    max={sec.maxScore}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-gray-400 text-sm">/ {sec.maxScore}</span>
                  <button
                    type="button"
                    onClick={() => removeSection(sec.id)}
                    disabled={sections.length === 1}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총점</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalScore} <span className="text-sm font-normal text-gray-500">/ {maxScore}</span>
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${getGradeColor(percentage)}`}>
              {percentage}% · {getGradeLabel(percentage)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              특이사항 / 메모
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="추가적으로 기록할 내용을 입력하세요"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </form>

        <div className="p-6 border-t flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {editStudent ? '수정 완료' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
