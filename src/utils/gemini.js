const TEXT_MODEL = 'gemini-2.0-flash-lite';
const IMAGE_MODEL = 'gemini-2.0-flash-preview-image-generation';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Generate text feedback for a student
export async function generateStudentFeedback(apiKey, student) {
  const prompt = `당신은 AI 리터러시 교육 전문가입니다. 다음 학생의 AI 리터러시 테스트 결과를 분석하고 맞춤형 피드백을 한국어로 작성해주세요.

학생 정보:
- 이름: ${student.name}
- 총점: ${student.totalScore}점 / ${student.maxScore}점 (${Math.round((student.totalScore / student.maxScore) * 100)}%)
- 학년/반: ${student.grade || '미입력'}

영역별 점수:
${student.sections.map(s => `- ${s.name}: ${s.score}점 / ${s.maxScore}점`).join('\n')}

특이사항: ${student.notes || '없음'}

다음 형식으로 피드백을 작성해주세요:

## 종합 평가
[2-3문장으로 전반적인 성취도 평가]

## 강점
[잘 수행한 영역 2-3가지]

## 개선 필요 영역
[보완이 필요한 영역 2-3가지]

## 학습 권장사항
[구체적인 학습 방향 3-4가지]`;

  const response = await fetch(
    `${BASE_URL}/${TEXT_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `API 오류: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '피드백 생성 실패';
}

// Generate overall class assessment
export async function generateClassAssessment(apiKey, students) {
  const avgScore = Math.round(
    students.reduce((sum, s) => sum + (s.totalScore / s.maxScore) * 100, 0) / students.length
  );

  const sectionAverages = {};
  students.forEach(student => {
    student.sections.forEach(sec => {
      if (!sectionAverages[sec.name]) sectionAverages[sec.name] = { total: 0, count: 0, max: sec.maxScore };
      sectionAverages[sec.name].total += sec.score;
      sectionAverages[sec.name].count += 1;
    });
  });

  const sectionSummary = Object.entries(sectionAverages)
    .map(([name, data]) => `- ${name}: 평균 ${(data.total / data.count).toFixed(1)}점 / ${data.max}점`)
    .join('\n');

  const scoreDistribution = {
    excellent: students.filter(s => (s.totalScore / s.maxScore) >= 0.9).length,
    good: students.filter(s => (s.totalScore / s.maxScore) >= 0.75 && (s.totalScore / s.maxScore) < 0.9).length,
    average: students.filter(s => (s.totalScore / s.maxScore) >= 0.6 && (s.totalScore / s.maxScore) < 0.75).length,
    needsImprovement: students.filter(s => (s.totalScore / s.maxScore) < 0.6).length,
  };

  const prompt = `당신은 AI 리터러시 교육 전문가입니다. 다음 학급 전체의 AI 리터러시 테스트 결과를 분석하고 종합 총평을 한국어로 작성해주세요.

학급 현황:
- 응시 학생 수: ${students.length}명
- 학급 평균: ${avgScore}%
- 성취 분포:
  • 우수 (90% 이상): ${scoreDistribution.excellent}명
  • 양호 (75-89%): ${scoreDistribution.good}명
  • 보통 (60-74%): ${scoreDistribution.average}명
  • 미흡 (60% 미만): ${scoreDistribution.needsImprovement}명

영역별 평균:
${sectionSummary}

다음 형식으로 총평을 작성해주세요:

## 학급 종합 총평
[3-4문장으로 학급 전반적인 AI 리터러시 수준 평가]

## 학급 강점 영역
[학급 전체가 잘 수행한 영역과 그 의미]

## 집중 지도 필요 영역
[전반적으로 보완이 필요한 영역과 원인 분석]

## 향후 교육 방향 제언
[학급 수준에 맞는 구체적인 교육 방향 4-5가지]

## 개별 지도 전략
[성취 수준별 맞춤 지도 방안]`;

  const response = await fetch(
    `${BASE_URL}/${TEXT_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `API 오류: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '총평 생성 실패';
}

// Generate proposal image using Gemini image generation
export async function generateProposalImage(apiKey, students, classAssessment) {
  const avgScore = Math.round(
    students.reduce((sum, s) => sum + (s.totalScore / s.maxScore) * 100, 0) / students.length
  );

  const prompt = `Create a professional, visually appealing educational infographic for an AI literacy test results report. The image should include:

- Title: "AI 리터러시 테스트 결과 보고서" (AI Literacy Test Results Report)
- A clean, modern design with blue and white color scheme
- Visual representation of class performance (${students.length} students, ${avgScore}% average)
- Icons representing different AI literacy skills: critical thinking, data understanding, AI ethics, practical application
- Professional educational document style suitable for a school report
- Korean text elements showing key statistics
- Clean infographic layout with charts and data visualization elements
- Modern flat design aesthetic`;

  const response = await fetch(
    `${BASE_URL}/${IMAGE_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `이미지 생성 API 오류: ${response.status}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('이미지 데이터를 찾을 수 없습니다.');
}
