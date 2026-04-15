import type { Itinerary } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Html2PdfInstance = any

export async function exportItineraryToPDF(itinerary: Itinerary): Promise<void> {
  // Dynamic import with any cast to avoid missing type declarations
  const mod = (await import('html2pdf.js')) as { default: Html2PdfInstance }
  const html2pdf = mod.default

  const container = document.createElement('div')
  container.style.fontFamily = 'Arial, sans-serif'
  container.style.color = '#111'
  container.style.padding = '32px'
  container.style.background = '#fff'
  container.style.maxWidth = '800px'

  const activityTypeLabel: Record<string, string> = {
    sightseeing: '🏛️ Ponto Turístico',
    food: '🍽️ Gastronomia',
    transport: '🚌 Transporte',
    accommodation: '🏨 Hospedagem',
    activity: '🎯 Atividade',
  }

  container.innerHTML = `
    <div style="text-align:center; margin-bottom: 32px; border-bottom: 3px solid #6366f1; padding-bottom: 24px;">
      <h1 style="font-size: 28px; font-weight: 700; color: #4f46e5; margin: 0 0 8px 0;">✈️ ${itinerary.title}</h1>
      <p style="font-size: 16px; color: #555; margin: 0;">
        📍 ${itinerary.destination} &nbsp;|&nbsp;
        📅 ${itinerary.startDate} → ${itinerary.endDate} &nbsp;|&nbsp;
        💰 Orçamento: ${itinerary.budget}
      </p>
      <p style="font-size: 13px; color: #888; margin-top: 8px;">Gerado em ${new Date(itinerary.createdAt).toLocaleDateString('pt-BR')} por Rota AI</p>
    </div>

    ${itinerary.days
      .map(
        (day) => `
      <div style="margin-bottom: 32px; page-break-inside: avoid;">
        <div style="background: #4f46e5; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 16px;">
          <h2 style="margin: 0; font-size: 18px;">Dia ${day.day} — ${day.date}</h2>
          <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.85;">${day.title}</p>
        </div>
        ${day.activities
          .map(
            (act) => `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 18px; margin-bottom: 10px; background: #f9fafb;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 12px; color: #6b7280; min-width: 50px;">${act.time}</span>
              <strong style="font-size: 15px; color: #111;">${act.title}</strong>
              <span style="font-size: 11px; color: #6366f1; margin-left: auto;">${activityTypeLabel[act.type] ?? act.type}</span>
            </div>
            <p style="margin: 0 0 6px; font-size: 13px; color: #374151;">${act.description}</p>
            ${act.location ? `<p style="margin: 0 0 4px; font-size: 12px; color: #6b7280;">📍 ${act.location.address}</p>` : ''}
            ${act.cost ? `<p style="margin: 0 0 4px; font-size: 12px; color: #059669;">💰 ${act.cost}</p>` : ''}
            ${act.tips ? `<p style="margin: 0; font-size: 12px; color: #d97706; font-style: italic;">💡 ${act.tips}</p>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    `
      )
      .join('')}

    <div style="text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
      Roteiro gerado pelo Rota AI — Planejador de Viagens com IA
    </div>
  `

  document.body.appendChild(container)

  try {
    await html2pdf()
      .from(container)
      .set({
        margin: 10,
        filename: `roteiro-${itinerary.destination.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save()
  } finally {
    document.body.removeChild(container)
  }
}
