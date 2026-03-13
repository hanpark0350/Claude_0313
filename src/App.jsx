import { useState, useEffect } from 'react';
import { Settings, Users, BarChart3, Bot, AlertCircle } from 'lucide-react';
import APIKeySettings from './components/APIKeySettings';
import StudentList from './components/StudentList';
import FeedbackModal from './components/FeedbackModal';
import ClassReport from './components/ClassReport';
import { loadApiKey, loadData, saveData } from './utils/storage';

const TABS = [
  { id: 'students', label: '학생 관리', icon: Users },
  { id: 'report', label: '학급 리포트', icon: BarChart3 },
  { id: 'settings', label: 'API 설정', icon: Settings },
];

export default function App() {
  const [apiKey, setApiKey] = useState(() => loadApiKey());
  const [data, setData] = useState(() => loadData());
  const [activeTab, setActiveTab] = useState('students');
  const [feedbackStudent, setFeedbackStudent] = useState(null);

  useEffect(() => {
    saveData(data);
  }, [data]);

  function addStudent(student) {
    setData(d => ({ ...d, students: [...d.students, student] }));
  }

  function updateStudent(student) {
    setData(d => ({
      ...d,
      students: d.students.map(s => s.id === student.id ? student : s),
    }));
  }

  function deleteStudent(id) {
    setData(d => ({ ...d, students: d.students.filter(s => s.id !== id) }));
  }

  function saveFeedback(studentId, feedback) {
    setData(d => ({
      ...d,
      students: d.students.map(s => s.id === studentId ? { ...s, feedback } : s),
    }));
  }

  function saveClassAssessment(text) {
    setData(d => ({ ...d, classAssessment: text }));
  }

  function saveProposalImage(imageData) {
    setData(d => ({ ...d, proposalImage: imageData }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4.5 h-4.5 text-white w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">AI 리터러시 피드백 시스템</h1>
          </div>
          {!apiKey && (
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              API 키 필요
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'settings' && (
          <APIKeySettings apiKey={apiKey} onApiKeyChange={setApiKey} />
        )}

        {activeTab === 'students' && (
          <StudentList
            students={data.students}
            onAdd={addStudent}
            onUpdate={updateStudent}
            onDelete={deleteStudent}
            onViewFeedback={setFeedbackStudent}
            apiKey={apiKey}
          />
        )}

        {activeTab === 'report' && (
          <ClassReport
            students={data.students}
            apiKey={apiKey}
            classAssessment={data.classAssessment || ''}
            proposalImage={data.proposalImage || ''}
            onSaveAssessment={saveClassAssessment}
            onSaveImage={saveProposalImage}
          />
        )}
      </main>

      {/* Feedback modal */}
      {feedbackStudent && (
        <FeedbackModal
          student={feedbackStudent}
          apiKey={apiKey}
          onClose={() => setFeedbackStudent(null)}
          onSave={saveFeedback}
        />
      )}
    </div>
  );
}
