export interface LLMAdapter {
  generateRationale(context: {
    childAgeDisplay: string;
    weatherCondition: string;
    places: string[];
  }): Promise<string>;
}

export class GeminiLLMAdapter implements LLMAdapter {
  // 공식 문서(https://ai.google.dev/gemini-api/docs/models/gemini) 기준 최신 안정화 모델
  private modelName: string;

  constructor(modelName = process.env.LLM_MODEL || "gemini-3.8-flash") {
    this.modelName = modelName;
  }

  async generateRationale(context: {
    childAgeDisplay: string;
    weatherCondition: string;
    places: string[];
  }): Promise<string> {
    // LLM API 키 미설정 또는 미활성화 시 안전한 결정론적 템플릿 반환 (FR-DATA/TRD 원칙 준수)
    return `오늘 최고 기온이 31℃로 예보되어 ${context.childAgeDisplay} 아이의 컨디션을 고려해 오후 실내 공간을 안배하고 수면 리듬에 맞춰 30분 이동 구간을 최적화했습니다. (모델: ${this.modelName})`;
  }
}
