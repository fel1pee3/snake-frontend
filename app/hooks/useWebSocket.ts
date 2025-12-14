/**
 * Hook useWebSocket - Gerencia conexão WebSocket com o servidor
 *
 * Responsabilidades:
 * - Estabelecer conexão WebSocket com o backend
 * - Enviar comandos de movimento
 * - Receber atualizações de estado do jogo
 * - Tratar desconexões
 * - Sincronizar estado com servidor
 *
 * Padrão: Custom React Hook
 * - Encapsula lógica WebSocket
 * - Reutilizável em múltiplos componentes
 * - Desacopla comunicação da renderização
 *
 * Uso:
 * const { gameState, sendMove, isConnected } = useWebSocket();
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Interface para o estado do jogo recebido do servidor
 */
interface Snake {
  id: string;
  body: Array<{ x: number; y: number }>;
  alive: boolean;
  score: number;
  activeEffects: Array<{ type: 'speedBoost' | 'slowDown'; endTime: number }>;
}

interface Fruit {
  x: number;
  y: number;
  type: 'apple' | 'mango';
}

interface GameState {
  status: 'lobby' | 'playing' | 'finished';
  snakes: Snake[];
  food: Fruit[];
  gameWidth: number;
  gameHeight: number;
}

interface LobbyStatus {
  status: string;
  playerCount: number;
  players: string[];
}

interface UseWebSocketReturn {
  gameState: GameState | null;
  lobbyStatus: LobbyStatus | null;
  socket: Socket | null;
  isConnected: boolean;
  sendMove: (direction: { dx: number; dy: number }) => void;
  playerId: string | null;
}

/**
 * Hook customizado para gerenciar WebSocket
 *
 * @returns Objeto contendo estado do jogo e funções de interação
 */
export function useWebSocket(): UseWebSocketReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lobbyStatus, setLobbyStatus] = useState<LobbyStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  /**
   * Envia comando de movimento para o servidor
   *
   * @param direction - Direção desejada { dx, dy }
   */
  const sendMove = useCallback(
    (direction: { dx: number; dy: number }) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('move', { direction });
      }
    },
    [isConnected]
  );

  /**
   * Efeito: Inicializar conexão WebSocket
   *
   * Operações:
   * 1. Conectar ao servidor WebSocket
   * 2. Registrar listeners para eventos
   * 3. Atualizar estado de conexão
   * 4. Cleanup ao desmontar componente
   */
  useEffect(() => {
    // Criar conexão WebSocket
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(apiUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    /**
     * Listener: Conexão estabelecida
     * Atualiza estado de conexão e armazena ID do jogador
     */
    socket.on('connect', () => {
      setIsConnected(true);
      setPlayerId(socket.id || null);
    });

    /**
     * Listener: Atualização do lobby
     */
    socket.on('lobbyUpdate', (status: LobbyStatus) => {
      setLobbyStatus(status);
    });

    /**
     * Listener: Estado do jogo atualizado
     * Atualiza o estado local com dados recebidos do servidor
     *
     * O servidor envia o estado completo após cada tick
     * Padrão: State Synchronization
     * Sincroniza todos os clientes através deste evento
     */
    socket.on('gameState', (state: GameState) => {
      console.log('📡 gameState recebido:', state);
      setGameState(state);
    });

    /**
     * Listener: Desconexão do servidor
     */
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    /**
     * Listener: Erro de conexão
     */
    socket.on('connect_error', () => {
      // Tenta reconectar automaticamente
    });

    /**
     * Cleanup: Fechar conexão ao desmontar
     */
    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    gameState,
    lobbyStatus,
    socket: socketRef.current,
    isConnected,
    sendMove,
    playerId,
  };
}
