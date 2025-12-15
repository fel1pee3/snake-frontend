'use client';

/**
 * Página Principal do Jogo
 *
 * Responsabilidades:
 * - Integrar hook WebSocket
 * - Gerenciar transição entre Lobby e Jogo
 * - Gerenciar input do teclado
 * - Renderizar componentes apropriados
 *
 * Padrão: Composição de componentes React
 * - Lobby: Sala de espera
 * - GameCanvas: Renderização do jogo
 * - useWebSocket: Comunicação
 * - Página: Orquestração
 */

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { GameCanvas } from '../components/GameCanvas';
import Lobby from '../components/Lobby';

/**
 * Componente raiz da página do jogo
 *
 * Fluxo:
 * 1. Conectar ao servidor WebSocket
 * 2. Mostrar Lobby até jogo iniciar
 * 3. Ao iniciar, mostrar GameCanvas
 * 4. Capturar input de teclado
 * 5. Enviar movimentos ao servidor
 * 6. Renderizar estado recebido
 */
export default function Game() {
  const { gameState, lobbyStatus, socket, isConnected, sendMove, playerId } = useWebSocket();
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const [showGame, setShowGame] = useState(false);

  /**
   * Efeito: Alternar entre Lobby e Game baseado no status
   * gameState pode estar null inicialmente, então verifica explicitamente
   */
  useEffect(() => {
    if (gameState && gameState.status === 'playing') {
      setShowGame(true);
    } else if (gameState && gameState.status === 'lobby') {
      setShowGame(false);
    } else if (gameState === null) {
      // Ainda carregando, mantém no lobby
      setShowGame(false);
    }
  }, [gameState?.status, gameState]);

  /**
   * Efeito: Capturar eventos de teclado
   *
   * Mapa de teclas:
   * - ArrowUp / W     → Cima (0, -1)
   * - ArrowDown / S   → Baixo (0, 1)
   * - ArrowLeft / A   → Esquerda (-1, 0)
   * - ArrowRight / D  → Direita (1, 0)
   *
   * Debounce: Evita enviar múltiplos movimentos muito rápido
   * Mínimo de 50ms entre movimentos
   */
  useEffect(() => {
    if (!showGame) return; // Só processa input durante o jogo

    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();

      // Debounce: não processar movimentos muito frequentes
      if (now - lastKeyTime < 50) return;

      let direction: { dx: number; dy: number } | null = null;

      switch (event.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          direction = { dx: 0, dy: -1 };
          break;
        case 'arrowdown':
        case 's':
          direction = { dx: 0, dy: 1 };
          break;
        case 'arrowleft':
        case 'a':
          direction = { dx: -1, dy: 0 };
          break;
        case 'arrowright':
        case 'd':
          direction = { dx: 1, dy: 0 };
          break;
        default:
          return;
      }

      if (direction) {
        event.preventDefault();
        sendMove(direction);
        setLastKeyTime(now);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sendMove, lastKeyTime, showGame]);

  /**
   * UI: Status de conexão
   */
  const connectionStatus = (
    <div className="fixed top-4 right-4 text-sm">
      <div
        className={`px-4 py-2 rounded ${
          isConnected
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white animate-pulse'
        }`}
      >
        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>
      {playerId && (
        <div className="text-gray-400 text-xs mt-2">ID: {playerId.slice(0, 8)}...</div>
      )}
    </div>
  );

  /**
   * UI: Tela de carregamento
   */
  if (!isConnected) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center flex-col gap-4">
        <div className="animate-spin">🐍</div>
        <p className="text-gray-400">Conectando ao servidor...</p>
        <p className="text-gray-600 text-sm">
          Certifique-se de que o backend está rodando em localhost:5000
        </p>
      </div>
    );
  }

  /**
   * UI: Mostrar Lobby ou Jogo
   * Baseado apenas no gameState?.status para sincronizar todos os clientes
   */
  if (!showGame) {
    return <Lobby socket={socket} />;
  }

  /**
   * UI: Jogo principal
   */
  return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center py-8">
      {connectionStatus}
      {gameState && gameState.status === 'playing' ? (
        <GameCanvas gameState={gameState} playerId={playerId} />
      ) : (
        <div className="text-center text-gray-400">
          <p className="animate-pulse">Aguardando estado do jogo...</p>
        </div>
      )}
    </div>
  );
}
