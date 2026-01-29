import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // MoneyFusion envoie généralement les données en JSON ou Form-Data
    const data = await request.json();
    console.log('MoneyFusion Webhook Received:', data);

    // Selon la documentation de MoneyFusion, on vérifie le statut
    // Les champs peuvent varier selon la version de l'API, mais on cherche
    // généralement un ID utilisateur et un montant ou un ID de pack.
    
    // Dans notre cas, nous avons passé userId et packId dans l'URL de retour,
    // mais pour le Webhook, MoneyFusion peut renvoyer des métadonnées personnalisées
    // si elles ont été configurées, ou on peut se baser sur les infos de transaction.

    // Si le statut est validé (exemple: statut === "success" ou "validated")
    const isSuccess = data.statut === true || data.status === 'success' || data.statut === 'success';

    if (isSuccess) {
      // Nous avons besoin d'identifier l'utilisateur. 
      // Idéalement, on utilise un 'orderId' unique généré lors de la création.
      
      // Pour l'instant, on va chercher l'utilisateur via les infos de la transaction 
      // si MoneyFusion les renvoie, ou via une logique de correspondance.
      
      // EXEMPLE DE LOGIQUE : 
      // Si tu as configuré MoneyFusion pour renvoyer le userId dans un champ personnalisé
      const userId = data.personal_Info?.[0]?.userId || data.reference; 
      const coinsAmount = data.personal_Info?.[0]?.coins || 0;
      const packId = data.personal_Info?.[0]?.packId;

      if (userId) {
        if (packId === 'premium' || packId === 'custom_bot_access') {
             // Activate Premium for 30 days
             const now = new Date();
             const expiresAt = new Date(now.setDate(now.getDate() + 30));
             
             await prisma.user.update({
                where: { id: userId },
                data: {
                    isPremium: true,
                    premiumExpiresAt: expiresAt
                }
             });
             console.log(`Successfully activated PREMIUM for user ${userId}`);
        } else if (coinsAmount) {
             // Add Coins
             await prisma.user.update({
                where: { id: userId },
                data: {
                  coins: { increment: parseInt(coinsAmount) }
                }
             });
             console.log(`Successfully added ${coinsAmount} coins to user ${userId}`);
        }
      }
    }

    // MoneyFusion attend souvent une réponse 200 pour confirmer la réception
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    // On répond quand même 200 pour éviter que MoneyFusion ne renvoie indéfiniment
    return NextResponse.json({ error: 'Internal Error' }, { status: 200 });
  }
}
