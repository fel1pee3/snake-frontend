'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import Lobby from './components/Lobby';
import { GameCanvas } from './components/GameCanvas';
import { EffectIndicator } from './components/EffectIndicator';

export default function Home() {
  const { gameState, socket, isConnected, sendMove, playerId } = useWebSocket();
  const [showGame, setShowGame] = useState(false);
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const [activeEffect, setActiveEffect] = useState<{ type: 'speedBoost' | 'slowDown'; endTime: number } | null>(null);

  // Quando o status for 'playing', mostra o jogo
  useEffect(() => {
    if (gameState?.status === 'playing') {
      setShowGame(true);
    }
  }, [gameState?.status]);

  // Detecta quando o jogador morre
  useEffect(() => {
    if (!gameState || !playerId || !showGame) return;

    const playerSnake = gameState.snakes.find((snake) => snake.id === playerId);

    if (playerSnake && !playerSnake.alive) {
      setTimeout(() => {
        setShowGame(false);
      }, 1000);
    }

    // Atualiza o efeito ativo do jogador
    if (playerSnake?.alive && playerSnake.activeEffects.length > 0) {
      const currentEffect = playerSnake.activeEffects[0];
      setActiveEffect(currentEffect);
    } else {
      setActiveEffect(null);
    }
  }, [gameState?.snakes, gameState?.status, playerId, showGame]);

  // Capturar input de teclado durante o jogo
  useEffect(() => {
    if (!showGame) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();
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

  // Loading
  if (!isConnected) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center flex-col gap-4">
        <div className="animate-spin text-4xl">🐍</div>
        <p className="text-gray-400">Conectando ao servidor...</p>
        <p className="text-gray-600 text-sm">Certifique-se de que o backend está rodando em localhost:5000</p>
      </div>
    );
  }

  // Mostrar Lobby ou Jogo
  if (!showGame) {
    return <Lobby socket={socket} onGameStart={() => setShowGame(true)} />;
  }

  // Jogo
  return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center py-8">
      <div className="fixed top-4 right-4 text-sm bg-green-500 text-white px-4 py-2 rounded">
        🟢 Conectado
      </div>

      {/* Indicador de Efeito */}
      <EffectIndicator effect={activeEffect} />

      {gameState && gameState.status === 'playing' ? (
        <GameCanvas gameState={gameState} playerId={playerId} />
      ) : (
        <p className="text-gray-400 animate-pulse">Carregando...</p>
      )}
    </div>
  );
}
