export interface Application {
  id?: number;
  user_id?: string;
  type?: string;
  company_name: string;
  position?: string;
  deadline?: string;
  status?: string;
  link?: string;
  memo?: string;
  application_questions?: ApplicationQuestion[];
  created_at?: string;
}

export interface ApplicationQuestion {
  id: number;
  created_at: string;
  application_id: number;   // 소속된 지원(회사) ID
  question: string;         // 자소서 항목 (예: 지원동기)
  topic?: string;           // 문항 주제
  keyword?: string;         // 키워드
  material?: string;        // 소재
  content?: string;         // 본문 내용
  char_limit?: string;      // 제한 글자수
}
