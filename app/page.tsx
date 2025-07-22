import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DownloadCloud, Github } from 'lucide-react';
import { CrowdinLogoIcon } from '@/components/icons/crowdin-logo-icon';
import { ClientAnimation } from '@/components/client-animation';
import { CopyButton } from '@/components/copy-button';

/**
 * Landing page that demonstrates a minimal Crowdin App with basic UI helpers
 * (manifest link sharing, GitHub reference, etc.). Now optimized as a Server Component
 * with client-side interactions extracted to separate components.
 */
export default async function Home() {
  const manifestUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/manifest.json`;

  return (
    <>
      {/* Skip Link for Screen Readers */}
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to main content
      </a>

      <div className="bg-background text-foreground relative flex min-h-screen flex-col items-center">
        <main
          id="main-content"
          className="flex h-screen w-full items-center justify-center"
          role="main"
        >
          <ClientAnimation className="relative flex flex-col items-center justify-center">
            <header
              className="relative z-10 flex w-full flex-col items-center border-b text-center"
              role="banner"
            >
              <div className="mb-16">
                <CrowdinLogoIcon className="text-primary h-[54px] w-[180px]" />
              </div>

              <h1 className="mb-6 text-4xl font-bold sm:text-5xl">
                Getting Started with Crowdin Apps
              </h1>
              <p className="text-muted-foreground mb-16 max-w-2xl text-lg">
                This is a sample Node application deployed to Heroku. It&apos;s a simple Crowdin App
                that&apos;s intended to be a good example of how to write apps for the Crowdin
                platform.
              </p>

              <nav
                className="mb-20 flex flex-col gap-4 sm:flex-row"
                role="navigation"
                aria-label="Quick actions"
              >
                <Button size="lg" className="text-base" aria-describedby="quick-start-desc">
                  <DownloadCloud className="mr-2 h-5 w-5" aria-hidden="true" />
                  Quick Start
                </Button>
                <span id="quick-start-desc" className="sr-only">
                  Download and get started with the Crowdin App
                </span>

                <Button
                  variant="outline"
                  size="lg"
                  className="text-base"
                  aria-describedby="github-desc"
                >
                  <Github className="mr-2 h-5 w-5" aria-hidden="true" />
                  Source on GitHub
                </Button>
                <span id="github-desc" className="sr-only">
                  View the source code on GitHub
                </span>
              </nav>
            </header>

            <section
              className="flex w-full max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8"
              aria-labelledby="installation-heading"
            >
              <h2 id="installation-heading" className="mb-6 text-3xl font-bold sm:text-4xl">
                Crowdin App is ready for installation
              </h2>
              <p className="text-muted-foreground mb-12 max-w-2xl text-lg">
                Deploy the app to the internet, go to your Crowdin Account Settings and install the
                app manually using the following link.
              </p>

              <div
                className="flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row"
                role="group"
                aria-labelledby="manifest-form"
              >
                <fieldset className="flex w-full flex-grow items-center">
                  <legend className="sr-only" id="manifest-form">
                    Manifest URL for app installation
                  </legend>
                  <Input
                    type="text"
                    defaultValue={manifestUrl}
                    readOnly
                    className="h-10 w-full flex-grow rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label="Manifest URL for Crowdin App installation"
                    aria-describedby="manifest-help"
                  />
                  <span id="manifest-help" className="sr-only">
                    Copy this URL to install the app in your Crowdin account
                  </span>
                  <CopyButton manifestUrl={manifestUrl} />
                </fieldset>
                <Button size="lg" className="w-full text-base sm:w-auto">
                  App Descriptor
                </Button>
              </div>
            </section>
          </ClientAnimation>
        </main>
      </div>
    </>
  );
}
