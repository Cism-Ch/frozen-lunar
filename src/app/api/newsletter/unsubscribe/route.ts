import { NextRequest, NextResponse } from "next/server";
import { NewsletterStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { logger } from "@/lib/logger";

function renderUnsubscribePage(title: string, description: string): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — ${COMPANY_CONFIG.shortName}</title>
</head>
<body style="margin:0;padding:32px 16px;background:#F2F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F172A;">
  <main style="max-width:520px;margin:48px auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;box-shadow:0 10px 25px rgba(0,31,61,0.08);">
    <div style="background:#001F3D;padding:24px 28px;border-bottom:4px solid #FF7C24;">
      <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#92A9BE;font-weight:700;">${COMPANY_CONFIG.shortName}</div>
      <h1 style="margin:8px 0 0;font-size:20px;color:#FFFFFF;">${title}</h1>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#334155;">${description}</p>
      <a href="/" style="display:inline-block;background:#FF7C24;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:10px;">
        Retour à l'accueil ${COMPANY_CONFIG.shortName}
      </a>
    </div>
  </main>
</body>
</html>`;
}

/**
 * Route publique de désinscription Newsletter en 1 clic par jeton unique.
 */
export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token")?.trim() || "";

    if (!token || token.length < 16 || token.length > 128) {
        return new NextResponse(
            renderUnsubscribePage(
                "Lien de désinscription invalide",
                "Ce lien de désinscription est incomplet ou expiré. Si vous souhaitez ne plus recevoir nos emails, contactez-nous directement."
            ),
            {
                status: 400,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "no-store",
                },
            }
        );
    }

    try {
        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { unsubscribeToken: token },
        });

        if (!subscriber) {
            return new NextResponse(
                renderUnsubscribePage(
                    "Abonnement introuvable",
                    "Votre adresse n'est plus inscrite ou ce lien a déjà été utilisé."
                ),
                {
                    status: 404,
                    headers: {
                        "Content-Type": "text/html; charset=utf-8",
                        "Cache-Control": "no-store",
                    },
                }
            );
        }

        if (subscriber.status !== NewsletterStatus.UNSUBSCRIBED) {
            await prisma.newsletterSubscriber.update({
                where: { id: subscriber.id },
                data: {
                    status: NewsletterStatus.UNSUBSCRIBED,
                    unsubscribedAt: new Date(),
                },
            });
        }

        return new NextResponse(
            renderUnsubscribePage(
                "Désinscription confirmée",
                "Votre adresse email a bien été retirée de la newsletter HBC Logistique. Vous ne recevrez plus nos envois marketing."
            ),
            {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error: unknown) {
        logger.error("Newsletter unsubscribe GET error", error);
        return new NextResponse(
            renderUnsubscribePage(
                "Erreur temporaire",
                "Impossible de traiter votre désinscription pour le moment. Merci de réessayer dans quelques instants."
            ),
            {
                status: 500,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "no-store",
                },
            }
        );
    }
}
