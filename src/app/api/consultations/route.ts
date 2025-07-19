import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { JWTService } from '@/lib/jwt';

// Configuration des webhooks n8n par agent
const N8N_WEBHOOKS = {
  accordeur: 'https://n8n.memoapp.eu/webhook/accordeur',
  peseur: 'https://n8n.memoapp.eu/webhook/peseur',
  denoueur: 'https://n8n.memoapp.eu/webhook/denoueur',
  evideur: 'https://n8n.memoapp.eu/webhook/evideur',
  habitant: 'https://n8n.memoapp.eu/webhook/habitant',
} as const;

// POST /api/consultations - Créer une nouvelle consultation via n8n
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = JWTService.requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const body = await request.json();
    
    // Validation des données
    const { agentType, situation, rituel } = body;
    
    if (!agentType || !situation) {
      return NextResponse.json(
        { error: 'Agent et situation requis' },
        { status: 400 }
      );
    }

    if (!N8N_WEBHOOKS[agentType as keyof typeof N8N_WEBHOOKS]) {
      return NextResponse.json(
        { error: 'Type d\'agent non valide' },
        { status: 400 }
      );
    }

    // Préparer le payload pour n8n
    const n8nPayload = {
      situation: situation.trim(),
      rituel: rituel || '',
      timestamp: new Date().toISOString(),
      userId: user.userId,
      userEmail: user.email,
      agentType
    };

    // Appel au webhook n8n avec retry et timeout
    const webhookUrl = N8N_WEBHOOKS[agentType as keyof typeof N8N_WEBHOOKS];
    
    // Fonction de retry avec backoff exponentiel
    const makeRequestWithRetry = async (maxRetries = 3): Promise<any> => {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        const timeout = 30000 + (attempt - 1) * 10000; // 30s, 40s, 50s
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          console.log(`Tentative ${attempt}/${maxRetries} pour ${agentType}:`, webhookUrl);
          
          const n8nResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(n8nPayload),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!n8nResponse.ok) {
            throw new Error(`n8n webhook error: ${n8nResponse.status} ${n8nResponse.statusText}`);
          }

          const n8nData = await n8nResponse.json();
          console.log(`Succès ${agentType} à la tentative ${attempt}`);
          return n8nData;

        } catch (error) {
          clearTimeout(timeoutId);
          lastError = error instanceof Error ? error : new Error('Erreur inconnue');
          
          console.log(`Échec tentative ${attempt}/${maxRetries} pour ${agentType}:`, lastError.message);
          
          // Si c'est la dernière tentative, on lance l'erreur
          if (attempt === maxRetries) {
            throw lastError;
          }
          
          // Délai avant retry (backoff exponentiel: 1s, 2s, 4s)
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`Attente ${delay}ms avant retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw lastError!;
    };

    const n8nData = await makeRequestWithRetry();
      
    // Retourner la réponse dans le format attendu par le frontend
    return NextResponse.json({
      success: true,
      data: {
        response: {
          consultation: n8nData.consultation,
          signature: n8nData.signature,
          sessionId: n8nData.session_id || n8nData.sessionId,
          timestamp: n8nData.timestamp,
          agentType
        }
      }
    });

  } catch (error) {
    console.error('Erreur API consultation:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la consultation';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

// GET /api/consultations - Récupérer l'historique des consultations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Paramètres de filtrage
    const agentName = searchParams.get('agent') || undefined;
    const ipAddress = searchParams.get('ip') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined;

    // Validation des paramètres
    if (limit > 100) {
      return NextResponse.json(
        { error: 'La limite ne peut pas dépasser 100 éléments' },
        { status: 400 }
      );
    }

    // Récupérer les consultations
    const { consultations, total } = await DatabaseService.getConsultations({
      limit,
      offset,
      agentName,
      ipAddress,
      startDate,
      endDate,
      userId
    });

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: consultations,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage
      },
      filters: {
        agentName,
        ipAddress,
        startDate,
        endDate,
        userId
      }
    });

  } catch (error) {
    console.error('Erreur API consultations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des consultations' 
      },
      { status: 500 }
    );
  }
}