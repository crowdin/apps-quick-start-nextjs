import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { refreshCrowdinToken } from '@/lib/crowdinAuth';

/** Data structure received when Crowdin fires the *installed* event. */
interface InstalledBody {
  appId: string;
  appSecret: string;
  domain: string;
  organizationId: string | number;
  userId: string | number;
  baseUrl: string;
}

/** Data structure received when Crowdin fires the *uninstall* event. */
interface UninstallBody {
  domain: string;
  organizationId: string | number;
}

/**
 * Unified POST handler for Crowdin *App events* (`installed`, `uninstall`).
 * Dispatches based on the dynamic `slug` in the route.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const body = await request.json();
  const { slug } = await params;

  switch (slug) {
    case 'installed': {
      const { CROWDIN_CLIENT_ID, CROWDIN_CLIENT_SECRET, AUTH_URL } = process.env;

      if (!CROWDIN_CLIENT_ID || !CROWDIN_CLIENT_SECRET || !AUTH_URL) {
        console.error('Missing environment variables for Crowdin OAuth');

        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      const eventBody = body as InstalledBody;

      let newTokenData: { accessToken: string; accessTokenExpires: number };
      try {
        newTokenData = await refreshCrowdinToken({
          appId: eventBody.appId,
          appSecret: eventBody.appSecret,
          domain: eventBody.domain,
          userId: Number(eventBody.userId),
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to obtain Crowdin token during installation.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }

      const organizationData = {
        domain: eventBody.domain,
        organizationId: Number(eventBody.organizationId),
        appId: eventBody.appId,
        appSecret: eventBody.appSecret,
        userId: Number(eventBody.userId),
        baseUrl: eventBody.baseUrl,
        accessToken: newTokenData.accessToken,
        accessTokenExpires: newTokenData.accessTokenExpires,
      };

      try {
        const existingOrganization = await prisma.organization.findFirst({
          where: {
            domain: eventBody.domain,
            organizationId: Number(eventBody.organizationId),
          },
        });

        if (existingOrganization) {
          await prisma.organization.update({
            where: { id: existingOrganization.id },
            data: organizationData,
          });
        } else {
          await prisma.organization.create({
            data: organizationData,
          });
        }

        return NextResponse.json(
          { message: 'Installation processed successfully' },
          { status: 200 }
        );
      } catch (dbError) {
        console.error('Database error during installed event:', dbError);

        return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
      }
    }

    case 'uninstall': {
      const eventBody = body as UninstallBody;

      try {
        await prisma.organization.deleteMany({
          where: {
            domain: eventBody.domain,
            organizationId: Number(eventBody.organizationId),
          },
        });

        return NextResponse.json(
          { message: 'Uninstallation processed successfully' },
          { status: 200 }
        );
      } catch (dbError) {
        console.error('Database error during uninstall event:', dbError);

        return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
      }
    }

    default:
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
