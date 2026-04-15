import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, phone, event_date, location, segments, meters, power, price } = await req.json();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: "kontakt@spogle.pl",
      subject: `Nowe zapytanie o tor przeszkód — ${name}`,
      body: `
        <h2>Nowe zapytanie z konfiguratora</h2>
        <p><strong>Imię:</strong> ${name}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Data wydarzenia:</strong> ${event_date || "nie podano"}</p>
        <p><strong>Lokalizacja:</strong> ${location || "nie podano"}</p>
        <hr/>
        <p><strong>Wybrane elementy:</strong> ${segments}</p>
        <p><strong>Łączna długość:</strong> ${meters}m</p>
        <p><strong>Wymagany prąd:</strong> ${power}</p>
        <p><strong>Szacowana cena:</strong> ${price}</p>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});