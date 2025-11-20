/**
 * ========================================
 * Exemple d'Intégration Frontend React
 * ========================================
 *
 * Ce fichier montre comment appeler les APIs sécurisées Med-MNG
 * depuis un frontend React/Next.js avec gestion complète:
 * - Authentification JWT
 * - Rate limiting
 * - Error handling
 * - Loading states
 * - Retry logic
 *
 * @version 1.0
 * @date 2025-11-19
 */

import { createClient } from '@supabase/supabase-js';
import { useState, useCallback } from 'react';

// ========================================
// CONFIGURATION SUPABASE
// ========================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ========================================
// TYPES
// ========================================

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  rateLimit?: {
    remaining: number;
    limit: number;
    resetAt: string;
  };
}

interface RateLimitError {
  error: string;
  message: string;
  remaining: number;
  resetAt: string;
  limit: number;
}

// ========================================
// HOOK: useSecureAPI
// ========================================

export function useSecureAPI<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [rateLimit, setRateLimit] = useState<{
    remaining: number;
    limit: number;
    resetAt: string;
  } | null>(null);

  const callAPI = useCallback(async (
    endpoint: string,
    body?: any,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
    }
  ) => {
    setLoading(true);
    setError(null);

    const maxRetries = options?.maxRetries || 3;
    const retryDelay = options?.retryDelay || 1000;

    let retries = 0;

    while (retries < maxRetries) {
      try {
        // 1. Obtenir le token de session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setError('Not authenticated. Please log in.');
          setLoading(false);
          throw new Error('Not authenticated');
        }

        // 2. Appeler l'API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${endpoint}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
          }
        );

        // 3. Extraire les headers de rate limiting
        const rateLimitInfo = {
          remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
          limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
          resetAt: response.headers.get('X-RateLimit-Reset') || '',
        };

        setRateLimit(rateLimitInfo);

        // 4. Gérer les différents codes de statut
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          setLoading(false);
          // Rediriger vers login
          window.location.href = '/login';
          return null;
        }

        if (response.status === 403) {
          const result = await response.json();
          setError(result.error || 'You do not have permission to perform this action.');
          setLoading(false);
          return null;
        }

        if (response.status === 429) {
          const result: RateLimitError = await response.json();
          const resetDate = new Date(result.resetAt);
          const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / 60000);

          setError(
            `Rate limit exceeded. You can make ${result.limit} requests per hour. ` +
            `Try again in ${minutesUntilReset} minutes.`
          );
          setLoading(false);
          return null;
        }

        if (response.status === 500) {
          // Retry en cas d'erreur serveur
          if (retries < maxRetries - 1) {
            console.warn(`Server error. Retrying in ${retryDelay}ms... (${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retries)));
            retries++;
            continue;
          }

          setError('Server error. Please try again later.');
          setLoading(false);
          return null;
        }

        // 5. Traiter la réponse
        const result: APIResponse<T> = await response.json();

        if (!result.success) {
          setError(result.error || 'An error occurred');
          setLoading(false);
          return null;
        }

        setData(result.data || null);
        setLoading(false);
        return result.data;

      } catch (err) {
        console.error('API error:', err);

        if (retries < maxRetries - 1) {
          console.warn(`Network error. Retrying in ${retryDelay}ms... (${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retries)));
          retries++;
          continue;
        }

        setError(err instanceof Error ? err.message : 'Network error');
        setLoading(false);
        return null;
      }
    }

    return null;
  }, []);

  return {
    loading,
    error,
    data,
    rateLimit,
    callAPI,
  };
}

// ========================================
// EXEMPLE D'UTILISATION: Génération de Musique
// ========================================

export function MusicGeneratorComponent() {
  const { loading, error, data, rateLimit, callAPI } = useSecureAPI();
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    const result = await callAPI('generate-music', {
      prompt,
      duration: 180,
      style: 'ambient',
    });

    if (result) {
      console.log('Music generated:', result);
      alert('Music generation started! Task ID: ' + result.taskId);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Music Generator</h2>

      {/* Rate Limit Info */}
      {rateLimit && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
          <p className="text-sm">
            <strong>Rate Limit:</strong> {rateLimit.remaining} / {rateLimit.limit} requests remaining
          </p>
          {rateLimit.remaining < 3 && (
            <p className="text-sm text-orange-600 mt-1">
              ⚠️ You're approaching your rate limit. Resets at {new Date(rateLimit.resetAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Music Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Describe the music you want to generate..."
            disabled={loading}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Music'}
        </button>
      </div>

      {/* Result */}
      {data && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <p className="text-green-700">
            ✅ Music generation started!
          </p>
          <p className="text-sm mt-1">
            Task ID: <code className="bg-white px-2 py-1 rounded">{data.taskId}</code>
          </p>
        </div>
      )}
    </div>
  );
}

// ========================================
// EXEMPLE D'UTILISATION: AI Chat
// ========================================

export function AIChatComponent() {
  const { loading, error, data, rateLimit, callAPI } = useSecureAPI();
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
  }>>([]);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Ajouter le message utilisateur
    const newConversation = [
      ...conversation,
      { role: 'user' as const, content: message },
    ];
    setConversation(newConversation);
    setMessage('');

    // Appeler l'API
    const result = await callAPI('content-ai-generator', {
      prompt: message,
      model: 'gpt-4',
      max_tokens: 1000,
    });

    if (result) {
      // Ajouter la réponse de l'assistant
      setConversation([
        ...newConversation,
        { role: 'assistant', content: result.content },
      ]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">AI Medical Assistant</h2>

      {/* Rate Limit Warning */}
      {rateLimit && rateLimit.remaining < 5 && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <p className="text-yellow-800">
            ⚠️ You have {rateLimit.remaining} requests remaining. Consider upgrading to premium for more requests.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Conversation */}
      <div className="mb-4 space-y-3 h-96 overflow-y-auto border rounded p-4 bg-gray-50">
        {conversation.length === 0 ? (
          <p className="text-gray-500 text-center">Start a conversation...</p>
        ) : (
          conversation.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded ${
                msg.role === 'user'
                  ? 'bg-blue-100 ml-auto max-w-[80%]'
                  : 'bg-white mr-auto max-w-[80%]'
              }`}
            >
              <p className="text-sm font-semibold mb-1">
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </p>
              <p className="text-sm">{msg.content}</p>
            </div>
          ))
        )}
        {loading && (
          <div className="bg-white p-3 rounded max-w-[80%]">
            <p className="text-sm text-gray-500">AI is typing...</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
          className="flex-1 p-2 border rounded"
          placeholder="Ask a medical question..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

// ========================================
// EXEMPLE D'UTILISATION: Admin Export
// ========================================

export function AdminExportComponent() {
  const { loading, error, data, callAPI } = useSecureAPI();
  const [exportType, setExportType] = useState<'patients' | 'courses' | 'analytics'>('patients');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  const handleExport = async () => {
    const result = await callAPI('admin-export', {
      type: exportType,
      format,
      startDate: '2025-01-01',
      endDate: new Date().toISOString().split('T')[0],
    });

    if (result) {
      // Télécharger le fichier
      window.open(result.downloadUrl, '_blank');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Data Export</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700">{error}</p>
          {error.includes('Admin role required') && (
            <p className="text-sm mt-1">
              This feature requires administrator privileges.
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Export Type</label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as any)}
            className="w-full p-2 border rounded"
            disabled={loading}
          >
            <option value="patients">Patients</option>
            <option value="courses">Courses</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            className="w-full p-2 border rounded"
            disabled={loading}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Exporting...' : 'Export Data'}
        </button>
      </div>

      {data && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <p className="text-green-700">✅ Export completed!</p>
          <p className="text-sm mt-1">
            Records: {data.recordCount}
          </p>
          <p className="text-sm">
            Download: <a href={data.downloadUrl} className="text-blue-600 underline" target="_blank">Click here</a>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Expires at: {new Date(data.expiresAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

// ========================================
// NOTES D'UTILISATION
// ========================================

/**
 * Pour utiliser ces composants:
 *
 * 1. Installez les dépendances:
 *    npm install @supabase/supabase-js
 *
 * 2. Configurez les variables d'environnement (.env.local):
 *    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 *
 * 3. Importez et utilisez les composants:
 *    import { MusicGeneratorComponent } from './examples/frontend-integration-react'
 *
 * 4. Le hook useSecureAPI gère automatiquement:
 *    - L'authentification JWT
 *    - Le rate limiting
 *    - Les erreurs (401, 403, 429, 500)
 *    - Les retries (3 tentatives max avec backoff exponentiel)
 *    - Les loading states
 *
 * 5. Personnalisez selon vos besoins:
 *    - Ajoutez vos propres endpoints
 *    - Modifiez les composants UI
 *    - Ajoutez des features (toast notifications, etc.)
 */
