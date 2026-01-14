import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter missing' }, { status: 400 })
  }

  try {
    // Utiliser Google Custom Search via une recherche basique
    // Alternative: Utiliser DuckDuckGo HTML search (pas d'API officielle mais on peut parser le HTML)

    // Pour l'instant, utilisons l'API SerpAPI gratuite limitée ou créons nos propres résultats
    // Comme nous n'avons pas de clé API, nous allons simuler une recherche

    // Appel à l'API DuckDuckGo Instant Answer (gratuite)
    const duckduckgoUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`

    const response = await fetch(duckduckgoUrl, {
      headers: {
        'User-Agent': 'Cell Browser'
      }
    })

    if (!response.ok) {
      throw new Error('Search API failed')
    }

    const data = await response.json()

    // Formater les résultats
    const results = []

    // Ajouter la réponse instantanée si disponible
    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL || '#',
        description: data.AbstractText,
        source: data.AbstractSource || 'DuckDuckGo'
      })
    }

    // Ajouter les résultats associés
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 60),
            url: topic.FirstURL,
            description: topic.Text,
            source: 'DuckDuckGo'
          })
        }
      })
    }

    // Si aucun résultat, proposer une recherche Google
    if (results.length === 0) {
      results.push({
        title: `Rechercher "${query}" sur Google`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        description: `Aucun résultat instantané trouvé. Cliquez pour rechercher sur Google.`,
        source: 'Google',
        external: true
      })
    }

    return NextResponse.json({
      query,
      results,
      count: results.length
    })

  } catch (error) {
    console.error('Search error:', error)

    // En cas d'erreur, proposer une recherche Google
    return NextResponse.json({
      query,
      results: [{
        title: `Rechercher "${query}" sur Google`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        description: `Erreur lors de la recherche. Cliquez pour rechercher sur Google.`,
        source: 'Google',
        external: true
      }],
      count: 1
    })
  }
}
