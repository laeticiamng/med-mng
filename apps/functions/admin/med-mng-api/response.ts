import { corsHeaders, securityHeaders } from "./types.ts";

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...securityHeaders,
    },
  });
}

// ✅ STANDARD ERROR RESPONSE - Conforme au ticket global backend
export function errorResponse(status: number, error: string, message: string, details?: any) {
  const responseData: any = { 
    error,           // Clé unique pour i18n frontend
    code: status,    // Code HTTP standard
    message,         // Message lisible
    timestamp: new Date().toISOString(),
    path: globalThis.currentPath || 'unknown'  // Pour debug
  };
  
  if (details) {
    responseData.details = details;
  }
  
  return jsonResponse(responseData, status);
}

export function successResponse(data: any, message?: string) {
  const responseData: any = { success: true, data };
  if (message) {
    responseData.message = message;
  }
  return jsonResponse(responseData);
}

export function paginatedResponse(
  items: any[],
  page: number,
  limit: number,
  totalCount: number,
  additionalData?: any
) {
  const responseData: any = {
    items,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1
    }
  };
  
  if (additionalData) {
    Object.assign(responseData, additionalData);
  }
  
  return jsonResponse(responseData);
}
