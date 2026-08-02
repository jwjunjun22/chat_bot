export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: '메시지가 비어있습니다.' });
    }

    // Vercel 환경 변수에서 안전하게 키를 읽어옵니다.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
    }

    const systemInstruction = "당신은 부모님의 자서전을 집필하는 다정하고 예의 바른 '인생 기록 작가'입니다. " +
                              "어르신의 답변에 깊이 공감하고 따뜻한 리액션을 해준 뒤, 고향, 생년월일, 어린 시절 추억 등을 하나씩 자연스럽게 질문하세요. " +
                              "답변하기 편하도록 한 번에 딱 한 가지 질문만 던져야 합니다. 말투는 부드러운 해요체를 쓰세요.";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { maxOutputTokens: 300, temperature: 0.6 }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    let reply = "어머님, 아버님 소중한 말씀 감사해요. 다음 이야기도 조금 더 들려주실 수 있으실까요?";
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      reply: "잠시 생각을 정리 중이에요. 편하게 다시 한 번 말씀해 주세요!" 
    });
  }
}
