import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { FileText, Image, Loader2, RefreshCw, Download, Copy, Check } from 'lucide-react';
import { generateClassAssessment, generateProposalImage } from '../utils/gemini';

function MarkdownText({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="text-sm font-semibold text-gray-900 mt-5 first:mt-0 flex items-center gap-1.5">
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

export default function ClassReport({ students, apiKey, classAssessment, proposalImage, onSaveAssessment, onSaveImage }) {
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [textError, setTextError] = useState('');
  const [imageError, setImageError] = useState('');
  const [copied, setCopied] = useState(false);

  if (students.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-gray-500 font-medium">학생 데이터가 없습니다</p>
        <p className="text-sm mt-1">학생 관리 탭에서 학생을 추가해주세요</p>
      </div>
    );
  }

  const avgPct = Math.round(
    students.reduce((sum, s) => sum + (s.totalScore / s.maxScore) * 100, 0) / students.length
  );

  const scoreDistribution = [
    { label: '우수 (90%+)', count: students.filter(s => (s.totalScore / s.maxScore) >= 0.9).length, color: '#10b981' },
    { label: '양호 (75-89%)', count: students.filter(s => { const p = s.totalScore / s.maxScore; return p >= 0.75 && p < 0.9; }).length, color: '#3b82f6' },
    { label: '보통 (60-74%)', count: students.filter(s => { const p = s.totalScore / s.maxScore; return p >= 0.6 && p < 0.75; }).length, color: '#f59e0b' },
    { label: '미흡 (60% 미만)', count: students.filter(s => (s.totalScore / s.maxScore) < 0.6).length, color: '#ef4444' },
  ];

  // Section averages for radar chart
  const sectionMap = {};
  students.forEach(student => {
    student.sections.forEach(sec => {
      if (!sectionMap[sec.name]) sectionMap[sec.name] = { total: 0, count: 0, max: sec.maxScore };
      sectionMap[sec.name].total += sec.score;
      sectionMap[sec.name].count += 1;
    });
  });
  const radarData = Object.entries(sectionMap).map(([name, data]) => ({
    subject: name,
    avg: Math.round((data.total / data.count / data.max) * 100),
    fullMark: 100,
  }));

  // Top/bottom students
  const sorted = [...students].sort((a, b) => (b.totalScore / b.maxScore) - (a.totalScore / a.maxScore));
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  async function handleGenerateText() {
    setLoadingText(true);
    setTextError('');
    try {
      const result = await generateClassAssessment(apiKey, students);
      onSaveAssessment(result);
    } catch (e) {
      setTextError(e.message);
    } finally {
      setLoadingText(false);
    }
  }

  async function handleGenerateImage() {
    setLoadingImage(true);
    setImageError('');
    try {
      const result = await generateProposalImage(apiKey, students, classAssessment);
      onSaveImage(result);
    } catch (e) {
      setImageError(e.message);
    } finally {
      setLoadingImage(false);
    }
  }

  async function handleCopyAssessment() {
    await navigator.clipboard.writeText(classAssessment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadImage() {
    const a = document.createElement('a');
    a.href = proposalImage;
    a.download = 'ai_literacy_report.png';
    a.click();
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">총 응시 학생</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary-600">{avgPct}%</p>
          <p className="text-xs text-gray-500 mt-0.5">학급 평균</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">
            {sorted[0] ? Math.round((sorted[0].totalScore / sorted[0].maxScore) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">최고 점수</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-500">
            {sorted[sorted.length - 1] ? Math.round((sorted[sorted.length - 1].totalScore / sorted[sorted.length - 1].maxScore) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">최저 점수</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score distribution bar chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">성취 수준 분포</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scoreDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v}명`, '학생 수']} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {scoreDistribution.map((entry, index) => (
                  <rect key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-2">
            {scoreDistribution.map(d => (
              <div key={d.label} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                {d.label.split(' ')[0]}: {d.count}명
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        {radarData.length >= 3 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">영역별 평균 성취도</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar name="평균" dataKey="avg" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                <Tooltip formatter={(v) => [`${v}%`, '평균']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top/Bottom students */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
            <span className="text-yellow-500">🏆</span> 상위 학생
          </h3>
          {top3.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 py-1.5">
              <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
              <span className="flex-1 text-sm text-gray-800">{s.name}</span>
              <span className="text-sm font-semibold text-emerald-600">
                {Math.round((s.totalScore / s.maxScore) * 100)}%
              </span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
            <span>📌</span> 지도 필요 학생
          </h3>
          {bottom3.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 py-1.5">
              <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
              <span className="flex-1 text-sm text-gray-800">{s.name}</span>
              <span className="text-sm font-semibold text-red-500">
                {Math.round((s.totalScore / s.maxScore) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Class assessment */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary-600" />
            학급 AI 총평
          </h3>
          <div className="flex gap-2">
            {classAssessment && (
              <button
                onClick={handleCopyAssessment}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '복사됨' : '복사'}
              </button>
            )}
            <button
              onClick={handleGenerateText}
              disabled={loadingText || !apiKey}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 disabled:opacity-40"
            >
              {loadingText ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {classAssessment ? '재생성' : 'AI 총평 생성'}
            </button>
          </div>
        </div>

        {textError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            오류: {textError}
          </div>
        )}

        {loadingText ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary-500" />
            <span className="text-sm">총평을 생성하고 있습니다...</span>
          </div>
        ) : classAssessment ? (
          <div className="bg-gray-50 rounded-xl p-4">
            <MarkdownText text={classAssessment} />
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">
            <p className="text-sm">AI 총평 생성 버튼을 눌러 학급 전체 총평을 받아보세요</p>
            {!apiKey && <p className="text-xs mt-1 text-gray-300">API 키를 먼저 설정해주세요</p>}
          </div>
        )}
      </div>

      {/* Proposal image */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
            <Image className="w-4 h-4 text-primary-600" />
            제안서 이미지 생성
          </h3>
          <div className="flex gap-2">
            {proposalImage && (
              <button
                onClick={downloadImage}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
              >
                <Download className="w-3.5 h-3.5" />
                다운로드
              </button>
            )}
            <button
              onClick={handleGenerateImage}
              disabled={loadingImage || !apiKey}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 disabled:opacity-40"
            >
              {loadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
              {proposalImage ? '이미지 재생성' : '이미지 생성'}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          Gemini 이미지 생성 모델로 AI 리터러시 결과 제안서용 인포그래픽 이미지를 만듭니다
        </p>

        {imageError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            오류: {imageError}
          </div>
        )}

        {loadingImage ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-purple-500" />
            <span className="text-sm">이미지를 생성하고 있습니다...</span>
            <span className="text-xs mt-1">잠시 시간이 걸릴 수 있습니다</span>
          </div>
        ) : proposalImage ? (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <img src={proposalImage} alt="AI 리터러시 결과 제안서 이미지" className="w-full" />
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-xl">
            <div className="text-3xl mb-2">🖼️</div>
            <p className="text-sm">이미지 생성 버튼을 눌러 제안서용 이미지를 만드세요</p>
            {!apiKey && <p className="text-xs mt-1 text-gray-300">API 키를 먼저 설정해주세요</p>}
          </div>
        )}
      </div>
    </div>
  );
}
