import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const { email, name, date, time, guests, restaurantName, logo, primaryColor, secondaryColor, address, telefonoRestaurante } = await req.json();
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${primaryColor}; padding: 20px; text-align: center;">
          <img src="${logo}" alt="${restaurantName}" style="max-height: 80px;" />
        </div>
        <div style="padding: 20px;">
          <h2 style="color: ${secondaryColor};">Hola ${name},</h2>
          <h2 style="color: ${secondaryColor};">Tu reserva ha sido confirmada:</h2>
          <ul style="font-size: 16px; list-style: none; padding: 0;">
            <li><strong>Fecha:</strong> ${formattedDate}</li>
            <li><strong>Hora:</strong> ${time}</li>
            <li><strong>Personas:</strong> ${guests}</li>
          </ul>
          <p><strong style="color: ${secondaryColor};">Te esperamos en </strong> ${address}</p>
          <p><strong style="color: ${secondaryColor};">Si deseas cancelar o modificar tu reserva, llama al:</strong> ${telefonoRestaurante}</p>

        </div>
        <div style="background-color: #f5f5f5; text-align: center; padding: 10px; font-size: 12px; color: #888;">
          Este es un email automático. No respondas a este mensaje.
        </div>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${restaurantName} <onboarding@resend.dev>`,
        to: email,
        subject: `Confirmación de reserva en ${restaurantName}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error Resend:", errorText);
      return new Response(JSON.stringify({ error: "Error enviando email" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const responseData = await response.json();

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error("Error general:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
