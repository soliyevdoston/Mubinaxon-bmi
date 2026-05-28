export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'

export type SessionStatus = 'WAITING' | 'ACTIVE' | 'PAUSED' | 'FINISHED'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: Role
  avatarUrl: string | null
}

export interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
  difficulty: number
  explanation: string | null
  topicId: string
}

export interface SessionParticipant {
  id: string
  userId: string
  fullName: string
  avatarUrl: string | null
  totalScore: number
  rank: number | null
}

export interface LeaderboardEntry {
  userId: string
  fullName: string
  avatarUrl: string | null
  totalScore: number
  rank: number
  answersCorrect: number
  answersTotal: number
}

export interface QuestionResult {
  questionId: string
  stats: {
    optionCounts: number[]
    correctIndex: number
    totalResponses: number
  }
  leaderboard: LeaderboardEntry[]
}

export interface SessionState {
  id: string
  code: string
  status: SessionStatus
  currentQuestionIndex: number
  totalQuestions: number
  timePerQuestionSec: number
  participants: SessionParticipant[]
}

// Socket.io event payloads
export interface SocketEvents {
  // Client → Server
  'session:join': { code: string; userId: string }
  'session:leave': { sessionId: string }
  'answer:submit': { sessionId: string; questionId: string; selectedIndex: number; responseTimeMs: number }
  'host:start': { sessionId: string }
  'host:nextQuestion': { sessionId: string }
  'host:pause': { sessionId: string }
  'host:end': { sessionId: string }

  // Server → Client
  'session:participantJoined': { user: SessionParticipant }
  'session:participantLeft': { userId: string }
  'session:started': { firstQuestion: QuizQuestion; deadline: number }
  'question:show': { question: QuizQuestion; deadline: number; questionIndex: number }
  'question:results': QuestionResult
  'session:ended': { finalResults: LeaderboardEntry[] }
  'leaderboard:update': { rankings: LeaderboardEntry[] }
}

// AI generation types
export interface GeneratedTopic {
  name: string
  description: string
}

export interface GeneratedQuestion {
  text: string
  options: string[]
  correctIndex: number
  difficulty: number
  topicIndex: number
  explanation: string
}

export interface AIGenerationResult {
  topics: GeneratedTopic[]
  questions: GeneratedQuestion[]
}
