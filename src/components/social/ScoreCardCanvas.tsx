/**
 * Generates a personalized score card image using HTML Canvas
 * for sharing on social media
 */
import React, { useCallback, useRef } from 'react';

export interface ScoreCardData {
  userName: string;
  score: number;
  totalQuestions: number;
  rank?: string;
  streak?: number;
  level?: number;
  badge?: string;
  specialty?: string;
  date?: string;
}

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function generateScoreCardImage(data: ScoreCardData): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Decorative circles
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(CARD_WIDTH - 100, 100, 250, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(150, CARD_HEIGHT - 80, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Border glow
    const borderGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
    borderGrad.addColorStop(0, '#6366f1');
    borderGrad.addColorStop(0.5, '#06b6d4');
    borderGrad.addColorStop(1, '#6366f1');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 3;
    roundRect(ctx, 10, 10, CARD_WIDTH - 20, CARD_HEIGHT - 20, 24);
    ctx.stroke();

    // Logo / Brand
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.fillText('🩺 MED-MNG', 50, 65);

    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(data.date || new Date().toLocaleDateString('fr-FR'), CARD_WIDTH - 200, 60);

    // User name
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(data.userName, 50, 140);

    // Specialty badge
    if (data.specialty) {
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(`📋 ${data.specialty}`, 50, 175);
    }

    // Score circle
    const centerX = CARD_WIDTH / 2;
    const centerY = 340;
    const radius = 120;

    // Score background ring
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Score progress ring
    const pct = data.score / 100;
    const scoreGrad = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    if (pct >= 0.8) {
      scoreGrad.addColorStop(0, '#22c55e');
      scoreGrad.addColorStop(1, '#10b981');
    } else if (pct >= 0.5) {
      scoreGrad.addColorStop(0, '#f59e0b');
      scoreGrad.addColorStop(1, '#eab308');
    } else {
      scoreGrad.addColorStop(0, '#ef4444');
      scoreGrad.addColorStop(1, '#f97316');
    }
    ctx.strokeStyle = scoreGrad;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.stroke();

    // Score text
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.textAlign = 'center';
    ctx.fillText(`${data.score}%`, centerX, centerY + 20);

    ctx.font = '20px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${data.totalQuestions} questions`, centerX, centerY + 55);

    // Stats cards
    ctx.textAlign = 'left';
    const statsY = 510;
    const stats = [
      { icon: '🔥', label: 'Série', value: `${data.streak ?? 0} jours` },
      { icon: '⭐', label: 'Niveau', value: `${data.level ?? 1}` },
      { icon: '🏆', label: 'Rang', value: data.rank || 'Non classé' },
    ];

    stats.forEach((stat, i) => {
      const x = 100 + i * 370;
      // Stat card bg
      ctx.fillStyle = 'rgba(51, 65, 85, 0.6)';
      roundRect(ctx, x, statsY, 300, 70, 12);
      ctx.fill();

      ctx.font = '24px system-ui, sans-serif';
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(`${stat.icon} ${stat.value}`, x + 20, statsY + 35);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(stat.label, x + 20, statsY + 57);
    });

    // Watermark
    ctx.textAlign = 'center';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('med-mng.lovable.app • Révise tes items EDN en musique 🎵', CARD_WIDTH / 2, CARD_HEIGHT - 25);

    resolve(canvas.toDataURL('image/png'));
  });
}

export function useScoreCardDownload() {
  const download = useCallback(async (data: ScoreCardData) => {
    const dataUrl = await generateScoreCardImage(data);
    const link = document.createElement('a');
    link.download = `med-mng-score-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    return dataUrl;
  }, []);

  return { download, generateImage: generateScoreCardImage };
}
