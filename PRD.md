# 쓰레기 분리배출 안내 MCP Server PRD

## 1. 개요 (Overview)
### 1.1 프로젝트 명
- **CleanGuide MCP** (가칭: 똑똑한 분리배출 가이드)

### 1.2 목적 (Purpose)
- 사용자가 일상생활에서 헷갈리는 쓰레기 분리배출 방법(예: 키보드, 깨진 유리 등)을 자연어로 질문하면, 정확한 배출 방법과 주의사항을 안내해주는 AI 에이전트용 MCP 서버를 구축함.
- 카카오 MCP 공모전 기준을 준수하며, 공공데이터 기반의 신뢰성 있는 정보를 제공함.

### 1.3 타겟 사용자 (Target Audience)
- 쓰레기 분리배출 방법에 대해 확신이 없어 검색이 필요한 모든 사용자.
- 1인 가구, 자취생 등 생활 폐기물 처리에 익숙하지 않은 사용자.

---

## 2. 기술 스택 및 환경 (Technical Stack)
- **Language**: TypeScript (Node.js)
- **MCP SDK**: `@modelcontextprotocol/sdk` (공식 TypeScript SDK 사용)
- **Transport**: SSE (Server-Sent Events) over HTTP (카카오 필수 요구사항: Streamable HTTP)
- **Data Source**: JSON 파일 기반 (DB 없이 경량화)
    - `recycling_db.json`: 품목별 배출 방법 데이터
    - `recycling_guide.json`: 재질별 가이드 및 FAQ 데이터
- **Runtime**: Node.js v18+

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 Tools 설계 (권장 3~20개 준수)
본 서버는 총 3개의 핵심 Tool을 제공하여 AI가 상황에 맞춰 적절한 도구를 호출할 수 있도록 함.

#### **Tool 1: `search_item_disposal`**
- **설명**: 특정 물건(품목)의 분리배출 방법을 검색합니다.
- **Input**:
    - `keyword` (string, 필수): 검색할 물건 이름 (예: "키보드", "수박 껍질", "깨진 유리")
- **Output**:
    - 해당 품목의 배출 방법(`dstrbt_cn`), 분류(`dstrbt_name`) 정보를 텍스트로 반환.
    - 검색 결과가 없을 경우, "해당 품목에 대한 정보를 찾을 수 없습니다." 메시지 반환.
- **데이터 소스**: `recycling_db.json`

#### **Tool 2: `get_material_guide`**
- **설명**: 재질(종이, 플라스틱, 캔 등)에 따른 일반적인 분리배출 가이드라인을 조회합니다.
- **Input**:
    - `material` (string, 필수): 재질 명 (예: "종이", "유리", "플라스틱", "비닐", "캔", "스티로폼", "건전지", "형광등")
- **Output**:
    - 해당 재질의 배출 요령(비운다, 헹군다 등), 재활용 가능/불가능 품목 상세 설명.
- **데이터 소스**: `recycling_guide.json` (`materials_guide`, `hazardous_waste_guide` 등 활용)

#### **Tool 3: `search_faq`**
- **설명**: 분리배출과 관련된 자주 묻는 질문(FAQ)을 검색합니다.
- **Input**:
    - `keyword` (string, 선택): 질문 키워드 (예: "영수증", "뚜껑", "이물질")
- **Output**:
    - 키워드와 연관된 Q&A 목록 반환.
- **데이터 소스**: `recycling_guide.json` (`faq` 배열 활용)

### 3.2 응답 포맷 (Response Format)
- 모든 응답은 자연어 처리에 적합한 텍스트 포맷(Markdown 권장)으로 제공.
- 24KB 제한을 준수하기 위해 검색 결과가 너무 많을 경우 상위 5~10개로 제한.

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

### 4.1 규정 준수 (Compliance - 카카오 가이드라인)
1.  **MCP 스펙 버전**: 2025-03-26 이상 준수.
2.  **전송 방식**: HTTP (SSE) 지원. (Stdio 방식 아님)
3.  **Stateless**: 별도의 세션 관리 없이 요청-응답 처리.
4.  **보안**:
    - 개인정보 수집 없음.
    - API Key 등 민감 정보 하드코딩 금지.
    - 401 Unauthorized 처리 로직 포함 (인증 미들웨어 뼈대 구현).
5.  **성능**:
    - 빠른 응답 속도 보장 (로컬 JSON 검색이므로 지연 없음).
    - 타임아웃 방지.

### 4.2 프로젝트 구조
```text
/
├── src/
│   ├── index.ts          # 서버 엔트리포인트 (Express + MCP SDK)
│   ├── tools/            # Tool 정의 및 로직
│   │   ├── searchItem.ts
│   │   ├── getMaterialGuide.ts
│   │   └── searchFaq.ts
│   ├── data/             # 데이터 파일 (JSON)
│   │   ├── recycling_db.json
│   │   └── recycling_guide.json
│   └── types/            # 타입 정의
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. 개발 로드맵 (Development Plan)

### Phase 1: 프로젝트 셋업
- Node.js 프로젝트 초기화 (`npm init`)
- TypeScript 및 MCP SDK 설치
- 데이터 파일(`data/`) 위치 및 로드 로직 구현

### Phase 2: Tool 구현
- `recycling_db.json` 데이터 파싱 및 검색 로직 구현 (`search_item_disposal`)
- `recycling_guide.json` 데이터 구조화 및 조회 로직 구현 (`get_material_guide`, `search_faq`)
- 각 Tool을 MCP Server에 등록

### Phase 3: HTTP 서버 연동
- Express.js를 사용하여 SSE(Server-Sent Events) 엔드포인트 구현
- MCP SDK의 `SSEServerTransport` 연결

### Phase 4: 테스트 및 검증
- 로컬 환경에서 MCP Inspector를 통한 표준 스펙 준수 여부 점검
- 에러 처리 (검색 결과 없음, 잘못된 입력 등) 및 응답 사이즈 확인

### Phase 5: 문서화 및 배포 준비
- `README.md` 작성 (실행 방법, Tool 설명)
- Dockerfile 작성 (선택 사항, 배포 용이성 위함)
