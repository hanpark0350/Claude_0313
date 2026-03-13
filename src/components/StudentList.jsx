import { useState } from 'react';
import { UserPlus, Edit3, Trash2, MessageSquare, ChevronDown, ChevronUp, Search } from 'lucide-react';
import StudentForm from './StudentForm';

function ScoreBadge({ score, max }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  if (pct >= 90) return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">우수 {pct}%</span>;
  if (pct >= 75) return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">양호 {pct}%</span>;
  if (pct >= 60) return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">보통 {pct}%</span>;
  return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">미흡 {pct}%</span>;
}

function ProgressBar({ score, max }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const color = pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-blue-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function StudentList({ students, onAdd, onUpdate, onDelete, onViewFeedback, apiKey }) {
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.grade?.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(student) {
    if (editTarget) {
      onUpdate(student);
    } else {
      onAdd(student);
    }
    setShowForm(false);
    setEditTarget(null);
  }

  function startEdit(student, e) {
    e.stopPropagation();
    setEditTarget(student);
    setShowForm(true);
  }

  function handleDelete(id, name, e) {
    e.stopPropagation();
    if (confirm(`"${name}" 학생을 삭제하시겠습니까?`)) {
      onDelete(id);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="학생 이름 또는 학년/반 검색"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          학생 추가
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          {students.length === 0 ? (
            <>
              <p className="font-medium text-gray-500">등록된 학생이 없습니다</p>
              <p className="text-sm mt-1">학생 추가 버튼을 눌러 시작하세요</p>
            </>
          ) : (
            <p className="text-gray-500">검색 결과가 없습니다</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((student, idx) => {
            const pct = Math.round((student.totalScore / student.maxScore) * 100);
            const isExpanded = expanded === student.id;

            return (
              <div
                key={student.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : student.id)}
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{student.name}</span>
                      {student.grade && <span className="text-xs text-gray-500">{student.grade}</span>}
                      <ScoreBadge score={student.totalScore} max={student.maxScore} />
                      {student.feedback && (
                        <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" />피드백 완료
                        </span>
                      )}
                    </div>
                    <ProgressBar score={student.totalScore} max={student.maxScore} />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900 text-sm">{student.totalScore}<span className="text-gray-400 font-normal">/{student.maxScore}</span></p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => startEdit(student, e)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={e => handleDelete(student.id, student.name, e)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {student.sections.map(sec => (
                        <div key={sec.id || sec.name} className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 mb-1 truncate">{sec.name}</p>
                          <p className="font-semibold text-sm text-gray-900">{sec.score}<span className="text-gray-400 font-normal">/{sec.maxScore}</span></p>
                        </div>
                      ))}
                    </div>
                    {student.notes && (
                      <p className="text-xs text-gray-500 mb-3 bg-yellow-50 rounded-lg p-2">
                        📝 {student.notes}
                      </p>
                    )}
                    <button
                      onClick={() => onViewFeedback(student)}
                      disabled={!apiKey}
                      className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {student.feedback ? 'AI 피드백 보기 / 재생성' : 'AI 피드백 생성'}
                    </button>
                    {!apiKey && <p className="text-xs text-center text-gray-400 mt-1">API 키를 먼저 설정해주세요</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <StudentForm
          onAdd={handleAdd}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          editStudent={editTarget}
        />
      )}
    </div>
  );
}
