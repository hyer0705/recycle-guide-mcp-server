import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerTools } from './tools/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(cors());
// JSON body parser (POST 요청 처리를 위해 필요할 수 있음)
app.use(express.json());

// MCP 서버 인스턴스 생성
const server = new McpServer({
  name: 'recycle-guide-mcp-server',
  version: '1.0.0',
});

// Tool 등록
registerTools(server);

// Streamable HTTP Transport 생성 (단일 인스턴스)
// 기존 SSEServerTransport와 달리, 이 Transport는 서버 전체의 상태를 관리합니다.
const transport = new StreamableHTTPServerTransport();

// 서버와 Transport 연결
// 비동기 연결이지만, 서버 시작 전에 완료되도록 처리
server.connect(transport);

// 인증 미들웨어 (예시)
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // 예: 특정 헤더가 필요한 경우 체크
  // const apiKey = req.headers['x-api-key'];
  // if (!apiKey) {
  //   return res.status(401).json({ error: 'Unauthorized: Missing API Key' });
  // }
  next();
};

// SSE 엔드포인트: 클라이언트 연결 및 메시지 처리 통합
// StreamableHTTPServerTransport는 단일 엔드포인트에서 GET(연결)과 POST(메시지)를 모두 처리합니다.
app.all('/sse', authMiddleware, async (req, res) => {
  console.log(`Incoming request: ${req.method} /sse`);
  await transport.handleRequest(req, res, req.body);
});

// 기존의 분리된 /messages 엔드포인트는 제거함 (app.post('/messages', ...) 삭제)

// 헬스 체크
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`SSE Endpoint: http://localhost:${PORT}/sse`);
});
