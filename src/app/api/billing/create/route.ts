import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Configuration MoneyFusion
// Note: Suppression de 'www.' pour éviter les timeouts DNS
const MONEYFUSION_API_URL = 'https://pay.moneyfusion.net/Wemove/3b2ccd753bf04364/pay/';

export async function POST(request: Request) {
  try {
    // 1. Authentification
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const cookies = parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    // 2. Récupération des données du pack
    const { packId, price, coins } = await request.json();
    
    // Conversion: 1$ = 650 FCFA
    let amount = Math.round(price * 650);
    
    // Override for Premium
    if (packId === 'premium') {
        amount = 9750; // 15$ * 650
    } else if (packId === 'custom_bot_access') {
        amount = 1300; // 2$ * 650
    }

    // 3. Préparation des données pour MoneyFusion
    // Utilisation du nom de domaine réel au lieu de localhost pour la validation de l'API
    const baseUrl = 'https://host.senstudio.space';
    const returnUrl = `${baseUrl}/dashboard/billing/callback?status=success&packId=${packId}&userId=${user.id}`;
    const webhookUrl = `${baseUrl}/api/billing/webhook`;

    // Format spécifique de MoneyFusion: Article est un objet { "Nom": Prix }
    const articleObject: { [key: string]: number } = {};
    if (packId === 'premium') {
        articleObject[`Abonnement Premium (1 Mois)`] = amount;
    } else if (packId === 'custom_bot_access') {
        articleObject[`Accès Bot Custom (Devient Premium)`] = amount;
    } else {
        articleObject[`Pack ${coins} Coins`] = amount;
    }

    const payload = {
      nomclient: user.username || 'Client',
      numeroSend: "22997000000",
      totalPrice: amount,
      article: [articleObject],
      personal_Info: [
        {
          userId: user.id,
          coins: coins || 0,
          packId: packId, // Pass packId to webhook
          orderId: `order_${Date.now()}`
        }
      ],
      return_url: returnUrl,
      webhook_url: webhookUrl
    };

    // 4. Appel à l'API MoneyFusion
    // Ajout d'un User-Agent et timeout géré par le système
    const response = await fetch(MONEYFUSION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SenHost/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('MoneyFusion Error:', errorText);
        return NextResponse.json({ error: 'Erreur de communication avec MoneyFusion' }, { status: 502 });
    }

    const data = await response.json();
    
    // MoneyFusion retourne généralement { url: "..." } ou { token: "..." }
    // Selon la doc résumée: "The API response includes a url field"
    
    if (data.url) {
        return NextResponse.json({ url: data.url });
    } else if (data.link) { // Parfois c'est 'link'
         return NextResponse.json({ url: data.link });
    } else {
         console.error('Réponse inattendue:', data);
         return NextResponse.json({ error: 'Pas d\'URL de paiement reçue' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
