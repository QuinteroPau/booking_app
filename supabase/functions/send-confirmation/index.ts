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
    const {
      email,
      name,
      date,
      time,
      guests,
      restaurantName,
      logo,
      primaryColor,
      secondaryColor,
      address,
      telefonoRestaurante,
      emailRestaurante,
      phone,
      specialRequests
    } = await req.json();

    const [year, month, day] = date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // HTML para el cliente
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

    // HTML exclusivo para el restaurante
    const htmlContentRestaurante = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: ${secondaryColor};">Nueva reserva en ${restaurantName}</h2>
        <ul style="font-size: 16px; list-style: none; padding: 0;">
          <li><strong>Nombre:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Teléfono:</strong> ${phone}</li>
          <li><strong>Fecha:</strong> ${formattedDate}</li>
          <li><strong>Hora:</strong> ${time}</li>
          <li><strong>Personas:</strong> ${guests}</li>
          <li><strong>Peticiones especiales:</strong> ${specialRequests || '-'}</li>
        </ul>
      </div>
    `;

    // ✅ Enviar email al cliente
    const responseCliente = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Reserva ${restaurantName} <reserva@seoceandigital.com>`,
        to: email,
        subject: `Confirmación de reserva en ${restaurantName}`,
        html: htmlContent,
      }),
    });

    if (!responseCliente.ok) {
      const errorText = await responseCliente.text();
      console.error("Error Resend cliente:", errorText);
      return new Response(JSON.stringify({ error: "Error enviando email al cliente" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const responseDataCliente = await responseCliente.json();

    // ✅ Enviar email al restaurante, solo si existe
    if (emailRestaurante) {
      const responseRestaurante = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Reserva ${restaurantName} <reserva@seoceandigital.com>`,
          to: emailRestaurante,
          subject: `Nueva reserva en ${restaurantName}`,
          html: htmlContentRestaurante,
        }),
      });

      if (!responseRestaurante.ok) {
        const errorText = await responseRestaurante.text();
        console.error("Error Resend restaurante:", errorText);
        return new Response(JSON.stringify({ error: "Error enviando email al restaurante" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    return new Response(JSON.stringify({ success: true, data: responseDataCliente }), {
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
