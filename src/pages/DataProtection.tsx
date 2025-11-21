import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const DataProtection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-4xl font-bold mb-4">Protection des Données</h1>
        <p className="text-muted-foreground mb-8">
          Découvrez comment CarFlex protège vos données personnelles et respecte vos droits.
        </p>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Conformité RGPD</CardTitle>
                  <CardDescription>Respect total du règlement européen</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p className="mb-4">
                CarFlex est pleinement conforme au Règlement Général sur la Protection des Données (RGPD) 
                en vigueur dans l'Union Européenne depuis mai 2018.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Collecte de données minimale et justifiée</li>
                <li>Transparence totale sur l'utilisation de vos données</li>
                <li>Respect de vos droits fondamentaux</li>
                <li>Mise en place de mesures techniques et organisationnelles appropriées</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Sécurité Renforcée</CardTitle>
                  <CardDescription>Technologies de pointe pour protéger vos données</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <h3 className="font-semibold mb-3">Mesures de sécurité mises en place :</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">🔐 Chiffrement SSL/TLS</h4>
                  <p className="text-sm">
                    Toutes les communications entre votre navigateur et nos serveurs sont chiffrées 
                    avec les protocoles les plus récents.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">🛡️ Politiques de sécurité au niveau des lignes (RLS)</h4>
                  <p className="text-sm">
                    Chaque utilisateur ne peut accéder qu'à ses propres données grâce à des règles de 
                    sécurité strictes au niveau de la base de données.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">🔑 Authentification sécurisée</h4>
                  <p className="text-sm">
                    Système d'authentification moderne avec hachage des mots de passe et protection 
                    contre les attaques par force brute.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">💾 Sauvegardes automatiques</h4>
                  <p className="text-sm">
                    Sauvegardes régulières et chiffrées de toutes les données pour garantir leur disponibilité 
                    et prévenir toute perte.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">🔍 Surveillance continue</h4>
                  <p className="text-sm">
                    Monitoring 24/7 pour détecter et réagir rapidement à toute tentative d'intrusion ou 
                    comportement suspect.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Transparence des Données</CardTitle>
                  <CardDescription>Vous savez toujours ce que nous collectons</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <h3 className="font-semibold mb-3">Types de données collectées :</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="mt-1">✓</div>
                  <div>
                    <span className="font-medium">Données d'identification :</span> Nom, prénom, email, 
                    téléphone, photo de profil
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">✓</div>
                  <div>
                    <span className="font-medium">Données de localisation :</span> Ville et pays pour 
                    localiser vos annonces
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">✓</div>
                  <div>
                    <span className="font-medium">Données de véhicules :</span> Photos et caractéristiques 
                    techniques pour les annonces
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">✓</div>
                  <div>
                    <span className="font-medium">Données de transaction :</span> Historique des achats 
                    de services premium (via Stripe)
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">✓</div>
                  <div>
                    <span className="font-medium">Données de navigation :</span> Pages visitées, recherches, 
                    favoris pour améliorer votre expérience
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Stockage et Conservation</CardTitle>
                  <CardDescription>Vos données sont stockées de manière sécurisée</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <h3 className="font-semibold mb-3">Hébergement et conservation :</h3>
              <div className="space-y-3">
                <p>
                  Vos données sont hébergées dans des centres de données sécurisés répondant aux normes 
                  les plus strictes en matière de sécurité et de confidentialité.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Durées de conservation :</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Compte actif : Données conservées pendant la durée d'activité</li>
                    <li>• Compte inactif : Suppression après 3 ans d'inactivité</li>
                    <li>• Annonces supprimées : Conservation 1 an pour raisons légales</li>
                    <li>• Données de transaction : 10 ans (obligations comptables)</li>
                    <li>• Cookies : Maximum 13 mois</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Vos Droits</CardTitle>
                  <CardDescription>Vous gardez le contrôle de vos données</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <h3 className="font-semibold mb-3">Exercez vos droits RGPD :</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="mt-1">👁️</div>
                  <div>
                    <span className="font-medium">Droit d'accès :</span> Obtenez une copie de toutes 
                    vos données personnelles
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">✏️</div>
                  <div>
                    <span className="font-medium">Droit de rectification :</span> Corrigez vos données 
                    inexactes ou incomplètes
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">🗑️</div>
                  <div>
                    <span className="font-medium">Droit à l'effacement :</span> Demandez la suppression 
                    de vos données personnelles
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">⏸️</div>
                  <div>
                    <span className="font-medium">Droit à la limitation :</span> Limitez le traitement 
                    de vos données
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">📦</div>
                  <div>
                    <span className="font-medium">Droit à la portabilité :</span> Récupérez vos données 
                    dans un format structuré
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">🚫</div>
                  <div>
                    <span className="font-medium">Droit d'opposition :</span> Opposez-vous au traitement 
                    de vos données
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="font-medium mb-2">Comment exercer vos droits ?</p>
                <p className="text-sm">
                  Contactez-nous à <strong>privacy@carflex.app</strong> avec votre demande. 
                  Nous nous engageons à vous répondre dans un délai maximum de 30 jours.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Partage des Données</CardTitle>
                  <CardDescription>Transparence sur le partage de vos informations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <h3 className="font-semibold mb-3">Avec qui partageons-nous vos données ?</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">👥 Autres utilisateurs</h4>
                  <p className="text-sm">
                    Lorsque vous publiez une annonce, votre nom, ville et photo de profil sont visibles 
                    pour faciliter le contact. Nous ne partageons JAMAIS votre email ou téléphone sans 
                    votre consentement explicite.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">💳 Prestataires de paiement</h4>
                  <p className="text-sm">
                    Stripe traite vos paiements de manière sécurisée. Nous ne stockons jamais vos 
                    données bancaires sur nos serveurs.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">🔧 Prestataires techniques</h4>
                  <p className="text-sm">
                    Hébergement cloud sécurisé pour le stockage de vos données et photos. Ces prestataires 
                    sont soumis à des accords de confidentialité stricts.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">⚖️ Autorités légales</h4>
                  <p className="text-sm">
                    Uniquement en cas d'obligation légale ou de demande judiciaire.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">
                  ⚠️ Nous ne vendons JAMAIS vos données à des tiers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Besoin d'aide ?</h2>
          <p className="text-muted-foreground mb-4">
            Si vous avez des questions sur la protection de vos données ou si vous souhaitez exercer 
            vos droits, notre équipe est à votre disposition.
          </p>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Email de protection des données :</strong> privacy@carflex.app
            </p>
            <p className="text-sm">
              <strong>Support général :</strong> support@carflex.app
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Pour en savoir plus, consultez notre{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Politique de Confidentialité complète
              </Link>
              {" "}et nos{" "}
              <Link to="/terms-of-service" className="text-primary hover:underline">
                Conditions Générales d'Utilisation
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DataProtection;
