'use client';

/**
 * Componente GameCanvas - Renderização Visual do Jogo
 *
 * Responsabilidades:
 * - Renderizar o mapa do jogo
 * - Desenhar cobras
 * - Desenhar comida
 * - Desenhar interface (scores, status)
 * - Capturar input do teclado
 * - Calcular conversão de coordenadas lógicas para pixels
 *
 * Tecnologia: HTML5 Canvas API
 * - Render direto em pixel
 * - Alto desempenho
 * - Completo controle visual
 *
 * Cores:
 * - Próprio jogador: #4CAF50 (verde)
 * - Outros jogadores: #2196F3 (azul)
 * - Comida: #FF9800 (laranja)
 * - Fundo: #1a1a1a (cinzento escuro)
 * - Grade: #444 (cinzento claro)
 */

import React, { useEffect, useRef, useState } from 'react';

interface Fruit {
  x: number;
  y: number;
  type: 'apple' | 'mango';
}

interface Snake {
  id: string;
  body: Array<{ x: number; y: number }>;
  alive: boolean;
  score: number;
  activeEffects: Array<{ type: 'speedBoost' | 'slowDown'; endTime: number }>;
}

interface GameState {
  snakes: Snake[];
  food: Fruit[];
  gameWidth: number;
  gameHeight: number;
}

interface GameCanvasProps {
  gameState: GameState | null;
  playerId: string | null;
}

/**
 * Componente de renderização do jogo
 *
 * @param gameState - Estado atual do jogo do servidor
 * @param playerId - ID do jogador local
 */
export function GameCanvas({ gameState, playerId }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastDirection, setLastDirection] = useState({ dx: 1, dy: 0 });

  // Dimensões do canvas
  const CELL_SIZE = 12;
  const GAME_WIDTH = gameState?.gameWidth || 100;
  const GAME_HEIGHT = gameState?.gameHeight || 60;
  const CANVAS_WIDTH = GAME_WIDTH * CELL_SIZE;
  const CANVAS_HEIGHT = GAME_HEIGHT * CELL_SIZE;

  // Cores
  const COLORS = {
    background: '#1a1a1a',
    grid: '#444',
    playerSnake: '#4CAF50',
    otherSnake: '#2196F3',
    food: '#FF9800',
    dead: '#666',
    text: '#FFF',
  };

  /**
   * Renderizar o jogo no canvas
   *
   * Ordem de renderização:
   * 1. Fundo e grade
   * 2. Comida
   * 3. Cobras
   * 4. Interface (scores)
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Renderizar fundo
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Renderizar grade
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GAME_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= GAME_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
      ctx.stroke();
    }

    // 3. Renderizar comida (múltiplas)
    gameState.food.forEach((food) => {
      drawFood(ctx, food);
    });

    // 4. Renderizar cobras
    gameState.snakes.forEach((snake) => {
      const isPlayerSnake = snake.id === playerId;
      drawSnake(ctx, snake, isPlayerSnake);
    });

    // 5. Renderizar interface
    drawUI(ctx, gameState.snakes, playerId);
  }, [gameState, playerId]);

  /**
   * Desenhar cobra no canvas
   *
   * @param ctx - Contexto do canvas
   * @param snake - Dados da cobra
   * @param isPlayer - Se é a cobra do jogador local
   */
  const drawSnake = (ctx: CanvasRenderingContext2D, snake: Snake, isPlayer: boolean) => {
    const color = isPlayer ? COLORS.playerSnake : COLORS.otherSnake;
    const deadColor = COLORS.dead;
    const currentColor = snake.alive ? color : deadColor;

    // Desenhar corpo
    snake.body.forEach((segment, index) => {
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;

      ctx.fillStyle = currentColor;
      ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

      // Cabeça com borda mais escura
      if (index === 0 && snake.alive) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    });
  };

  /**
   * Desenhar uma fruta no canvas
   *
   * @param ctx - Contexto do canvas
   * @param fruit - Fruta com tipo e posição
   */
  const drawFood = (ctx: CanvasRenderingContext2D, fruit: Fruit) => {
    const x = fruit.x * CELL_SIZE + CELL_SIZE / 2;
    const y = fruit.y * CELL_SIZE + CELL_SIZE / 2;

    // Emoji das frutas
    const fruitEmojis: Record<string, string> = {
      apple: '🍎',
      mango: '🥭',
    };

    ctx.font = `bold ${CELL_SIZE - 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fruitEmojis[fruit.type] || '🍎', x, y);
  };

  /**
   * Desenhar interface do jogo (scores e status)
   *
   * @param ctx - Contexto do canvas
   * @param snakes - Lista de cobras
   * @param playerId - ID do jogador local
   */
  const drawUI = (
    ctx: CanvasRenderingContext2D,
    snakes: Snake[],
    playerId: string | null
  ) => {
    // Desenhar scores
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';

    let yOffset = 20;
    snakes.forEach((snake, index) => {
      const isPlayer = snake.id === playerId;
      const prefix = isPlayer ? '👤 Você' : '🤖 Jogador';
      const statusText = snake.alive ? '✓ Vivo' : '✗ Morto';

      ctx.fillStyle = isPlayer ? COLORS.playerSnake : COLORS.otherSnake;
      ctx.fillText(
        `${prefix} - Score: ${snake.score} - ${statusText}`,
        10,
        yOffset
      );
      yOffset += 25;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">🐍 Snake Multiplayer</h1>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-gray-700 bg-gray-900"
      />
    </div>
  );
}
