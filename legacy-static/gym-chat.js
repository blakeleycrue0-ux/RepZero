// Netlify Function: proxies chat requests to Anthropic so the API key
// never touches the browser. Set ANTHROPIC_API_KEY in Netlify's
// environment variables (Site settings > Environment variables).

const ONBOARDING_PROMPT = `Eres Gym AI, parte de la app RepZero. Estás dando la bienvenida a un usuario nuevo con una conversación breve y natural en español, para conocerlo antes de armarle su plan de entrenamiento semanal.

Debes averiguar, UNA pregunta a la vez, sin listas ni párrafos largos:
1. Su objetivo (ganar músculo, perder grasa, mantener, fuerza)
2. Su nivel de experiencia (principiante, intermedio, avanzado)
3. Cuántos días a la semana puede entrenar
4. Qué equipo tiene disponible (gimnasio completo, casa con pesas, sin equipo)
5. Si tiene alguna lesión o limitación física

Sé cercano y motivador, como un entrenador de confianza, no como un formulario. Una pregunta por mensaje, corta.

Cuando ya tengas las 5 respuestas, responde con un mensaje breve de cierre confirmando que le armaste su plan, Y AL FINAL agrega un bloque de código con este formato exacto (esto no lo ve el usuario, lo procesa la app):

\`\`\`json
{
  "profile": {
    "goal": "...",
    "experience_level": "...",
    "days_per_week": 4,
    "equipment_access": "...",
    "injuries": "..."
  },
  "plan": {
    "days": [
      { "day": "Lunes", "focus": "Pecho y tríceps", "exercises": [
        { "name": "Press banca", "sets": 4, "reps": "8-10" },
        { "name": "Press inclinado mancuernas", "sets": 3, "reps": "10-12" }
      ]}
    ]
  }
}
\`\`\`

El plan debe tener tantos días como el usuario indicó que puede entrenar, con ejercicios reales y apropiados a su nivel y equipo. No incluyas el bloque json hasta tener las 5 respuestas.`;

function ongoingPrompt(profile, plan) {
  return `Eres Gym AI, parte de la app RepZero. Este es el perfil del usuario: ${JSON.stringify(profile)}. Este es su plan actual: ${JSON.stringify(plan)}.

Responde sus preguntas sobre su entrenamiento: técnica, sustituir ejercicios, series/repeticiones, motivación, dudas durante el gym. Sé breve y directo, como un mensaje de texto, no un ensayo.

Si el usuario pide cambiar algo del plan (sustituir un ejercicio, ajustar series, etc.), aplica el cambio y al final de tu respuesta agrega:

\`\`\`json
{ "plan_update": true, "content": { ...plan completo actualizado con la misma estructura... } }
\`\`\`

Si no hay cambio de plan, no agregues ningún bloque json, solo responde normalmente.`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { messages, mode, profile, plan } = JSON.parse(event.body);

    const systemPrompt = mode === 'onboarding'
      ? ONBOARDING_PROMPT
      : ongoingPrompt(profile, plan);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.length ? messages : [{ role: 'user', content: 'Hola' }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: errText }) };
    }

    const data = await response.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
