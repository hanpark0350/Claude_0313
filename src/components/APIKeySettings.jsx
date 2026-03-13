import { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle, ExternalLink } from 'lucide-react';
import { saveApiKey } from '../utils/storage';

export default function APIKeySettings({ apiKey, onApiKeyChange }) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveApiKey(inputKey.trim());
    onApiKeyChange(inputKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Key className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Google Gemini API 설정</h2>
            <p className="text-sm text-gray-500">AI 피드백 생성을 위한 API 키를 입력해주세요</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium mb-1">API 키 발급 방법</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Google AI Studio (aistudio.google.com) 접속</li>
            <li>"Get API Key" 클릭 후 새 API 키 생성</li>
            <li>생성된 키를 아래에 입력</li>
          </ol>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Google AI Studio 바로가기 <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              API 키
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!inputKey.trim()}
            className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                저장 완료
              </>
            ) : (
              'API 키 저장'
            )}
          </button>
        </div>

        {apiKey && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            API 키가 설정되어 있습니다
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">
            <strong>사용 모델</strong><br />
            • 텍스트 생성: gemini-2.0-flash-lite (피드백, 총평)<br />
            • 이미지 생성: gemini-2.0-flash-exp (제안서 이미지)<br />
            <br />
            API 키는 브라우저 로컬 스토리지에만 저장되며 외부 서버로 전송되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
