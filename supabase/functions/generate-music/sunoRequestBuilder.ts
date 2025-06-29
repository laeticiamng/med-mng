
export function createSunoRequest(lyrics: string, style: string, rang: 'A' | 'B') {
  return {
    prompt: lyrics,
    style: style,
    title: `Rang ${rang} - ${style}`,
    model: "V4",
    custom_mode: true,
    instrumental: false,
    wait_audio: false,
    callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-music/callback`
  };
}
