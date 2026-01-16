# CleanGuide MCP Server (쓰레기 분리배출 안내)

카카오 MCP 공모전 출품용으로 제작된 **쓰레기 분리배출 안내 MCP 서버**입니다.
사용자가 자연어로 쓰레기 배출 방법을 물어보면, 공공데이터 기반의 정확한 분리배출 요령을 안내합니다.

## 프로젝트 개요

- **목적**: 헷갈리는 쓰레기 분리배출 방법(품목별, 재질별) 안내
- **기술 스택**: TypeScript, Node.js, Express, @modelcontextprotocol/sdk
- **특징**:
  - 카카오 MCP 가이드라인 준수 (HTTP SSE Transport, Stateless)
  - 로컬 JSON 데이터 사용으로 빠른 응답 속도
  - 개인정보 수집 없음

## 설치 및 실행 방법

### 1. 필수 요구사항
- Node.js v18 이상
- npm

### 2. 설치
```bash
npm install
```

### 3. 빌드
```bash
npm run build
```

### 4. 실행
```bash
npm start
```
서버는 기본적으로 `3000` 포트에서 실행됩니다.
- SSE 엔드포인트: `http://localhost:3000/sse`

### 5. 개발 모드
```bash
npm run dev
```

## 제공되는 Tools

### 1. `search_item_disposal`
- **설명**: 특정 물건의 이름으로 분리배출 방법을 검색합니다.
- **예시 질문**: "키보드 어떻게 버려?", "수박 껍질은 음식물 쓰레기야?"

### 2. `get_material_guide`
- **설명**: 재질(종이, 플라스틱 등)이나 폐기물 종류(폐가전, 대형폐기물)에 따른 가이드를 제공합니다.
- **예시 질문**: "플라스틱 버리는 법 알려줘", "폐가전 무료 수거 방법"

### 3. `search_faq`
- **설명**: 자주 묻는 질문(FAQ)을 검색합니다.
- **예시 질문**: "영수증은 재활용 되나요?", "병뚜껑은 어떻게 해요?"

## 카카오 MCP 심사 기준 준수 사항

- **최소 지원 버전**: MCP 2025-03-26 스펙 준수 (SDK `^1.0.0` 사용)
- **Transport**: `SSEServerTransport` (Streamable HTTP) 사용
- **Stateless**: 세션을 메모리(`Map`)에서 관리하되, 영구 저장소 없이 동작 (서버 재시작 시 초기화)
- **보안**: 개인정보를 수집하지 않으며, 401 Unauthorized 처리를 위한 미들웨어 구조 포함

## 테스트 방법 (MCP Inspector)

서버를 실행한 상태에서 MCP Inspector를 통해 테스트할 수 있습니다.

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse
```

## 라이선스
MIT
