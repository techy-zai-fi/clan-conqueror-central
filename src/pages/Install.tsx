import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader,CardTitle } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Install Our App
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the full experience with our Progressive Web App. Install it on your device for quick access and offline functionality.
          </p>
        </div>

        {isInstalled ? (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>Already Installed!</CardTitle>
                  <CardDescription>
                    The app is already installed on your device. You can access it from your home screen.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <>
            {isInstallable && (
              <Card className="mb-8 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-6 h-6" />
                    Install Now
                  </CardTitle>
                  <CardDescription>
                    Click the button below to install the app on your device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleInstallClick} 
                    className="w-full"
                    size="lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Install App
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-6 h-6 text-primary" />
                    <CardTitle>iOS (iPhone/iPad)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <p className="text-sm">Open this page in <strong>Safari</strong></p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <p className="text-sm">Tap the <strong>Share</strong> button (square with arrow)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <p className="text-sm">Select <strong>"Add to Home Screen"</strong></p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                      4
                    </div>
                    <p className="text-sm">Tap <strong>"Add"</strong> to confirm</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-6 h-6 text-primary" />
                    <CardTitle>Android</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <p className="text-sm">Open this page in <strong>Chrome</strong></p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <p className="text-sm">Tap the <strong>menu</strong> button (three dots)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <p className="text-sm">Select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                      4
                    </div>
                    <p className="text-sm">Tap <strong>"Install"</strong> to confirm</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Fast Loading</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Instant access with optimized performance and quick load times
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📱 Home Screen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Quick access directly from your device's home screen like a native app
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔄 Auto Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Always get the latest features and updates automatically
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
