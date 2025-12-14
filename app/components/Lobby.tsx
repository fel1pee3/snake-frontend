'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface LobbyProps {
  socket: Socket | null;
}

interface LobbyStatus {
  status: string;
  playerCount: number;
  players: string[];
}

export default function Lobby({ socket }: LobbyProps) {
  const [lobbyStatus, setLobbyStatus] = useState<LobbyStatus>({
    status: 'lobby',
    playerCount: 0,
    players: [],
  });
  const [showFruitInfo, setShowFruitInfo] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleLobbyUpdate = (data: LobbyStatus) => {
      setLobbyStatus(data);
    };

    socket.on('lobbyUpdate', handleLobbyUpdate);

    return () => {
      socket.off('lobbyUpdate', handleLobbyUpdate);
    };
  }, [socket]);

  const handleStartGame = () => {
    // Jogo começa automaticamente, este método não é mais usado
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl p-12 shadow-2xl max-w-md w-full border-2 border-cyan-500">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-cyan-400 mb-2">🐍 SNAKE</h1>
          <p className="text-gray-300 text-lg">Multiplayer Game</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-6 mb-8 border border-cyan-500">
          <h2 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            Jogadores Online
          </h2>
          
          <div className="text-3xl font-bold text-cyan-300 text-center mb-2">
            {lobbyStatus.playerCount}
          </div>
          
          <p className="text-gray-400 text-center text-sm mb-4">
            {lobbyStatus.playerCount === 1
              ? 'Você está sozinho'
              : `${lobbyStatus.playerCount} jogadores online`}
          </p>

          <div className="bg-slate-600 rounded p-3 border border-cyan-400">
            <p className="text-cyan-300 text-center font-semibold animate-pulse">
              ✓ Jogo iniciando...
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFruitInfo(true)}
          className="w-full py-3 px-6 rounded-lg font-bold text-sm bg-purple-600 text-white hover:bg-purple-500 active:scale-95 transition-all"
        >
          📖 Frutas & Habilidades
        </button>
      </div>

      {/* Modal de Frutas */}
      {showFruitInfo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowFruitInfo(false)}
        >
          <div
            className="bg-slate-800 p-8 rounded-2xl border-2 border-purple-500 max-w-2xl w-11/12 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">
              🍎 Frutas & Habilidades
            </h2>

            <div className="flex flex-col gap-4">
              {/* Maçã */}
              <div className="bg-slate-700 p-4 rounded-lg border border-red-500">
                <h3 className="text-red-300 font-bold mb-2 text-lg">🍎 Maçã</h3>
                <p className="text-gray-300 text-sm">
                  <strong>Efeito:</strong> +10 pontos
                </p>
              </div>

              {/* Manga */}
              <div className="bg-slate-700 p-4 rounded-lg border border-amber-500">
                <h3 className="text-amber-300 font-bold mb-2 text-lg">🥭 Manga</h3>
                <p className="text-gray-300 text-sm">
                  <strong>Efeito:</strong> +20 pontos
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFruitInfo(false)}
              className="w-full mt-6 py-3 px-6 rounded-lg font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
