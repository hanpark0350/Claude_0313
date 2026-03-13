import { useState } from 'react';
import { X, RefreshCw, Copy, Check, Loader2, MessageSquare } from 'lucide-react';
import { generateStudentFeedback } from '../utils/gemini';

function MarkdownText({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="text-sm font-semibold text-gray-900 mt-4 first:mt-0 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-primary-500 rounded-full inline-block" />
              {line.replace('## ', '')}
            </h3>
          );
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <p key={i} className="text-sm text-gray-700 pl-3 flex gap-1.5">
              <span className="text-primary-400 mt-0.5 flex-shrink-0">•</span>
              <span>{line.replace(/^[-•] /, '')}</span>
            </p>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm text-gray-700">{line}</p>;
      })}
    </div>
  );
}

export default function FeedbackModal({ student, apiKey, onClose, onSave }) {
  const [feedback, setFeedback] = useState(student.feedback || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const pct = Math.round((student.totalScore / student.maxScore) * 100);

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const result = await generateStudentFeedback(apiKey, student);
      setFeedback(result);
      onSave(student.id, result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyFeedback() {
    await navigator.clipboard.writeText(feedback);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getGradeInfo(pct) {
    if (pct >= 90) return { label: '우수', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (pct >= 75) return { label: '양호', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (pct >= 60) return { label: '보통', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { label: '미흡', color: 'text-red-600 bg-red-50 border-red-200' };
  }
  const grade = getGradeInfo(pct);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">{student.name} 학생 AI 피드백</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{student.totalScore}</p>
              <p className="text-xs text-gray-500">/ {student.maxScore}점</p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${grade.color}`}>
              {grade.label} ({pct}%)
            </div>
            <div className="flex gap-2 flex-wrap flex-1">
              {student.sections.map(sec => (
                <div key={sec.id || sec.name} className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-center min-w-[80px]">
                  <p className="text-xs text-gray-500">{sec.name}</p>
                  <p className="text-sm font-semibold text-gray-800">{sec.score}/{sec.maxScore}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              오류: {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary-500" />
              <p className="text-sm">AI 피드백을 생성하고 있습니다...</p>
            </div>
          ) : feedback ? (
            <div className="prose max-w-none">
              <MarkdownText text={feedback} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-4xl mb-3">💭</div>
              <p className="text-gray-500 font-medium">아직 피드백이 없습니다</p>
              <p className="text-sm mt-1">아래 버튼을 눌러 AI 피드백을 생성하세요</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-3">
          {feedback && (
            <button
              onClick={copyFeedback}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? '복사됨' : '복사'}
            </button>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {feedback ? 'AI 피드백 재생성' : 'AI 피드백 생성'}
          </button>
        </div>
      </div>
    </div>
  );
}
