import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyDialog({ open, onOpenChange }: PrivacyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Politique de Confidentialité</DialogTitle>
          <DialogDescription>
            Dernière mise à jour : 15 octobre 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
              <p className="text-muted-foreground">
                CarFlex s'engage à protéger votre vie privée et vos données personnelles. Cette politique explique 
                comment nous collectons, utilisons, partageons et protégeons vos informations personnelles conformément 
                au RGPD.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Données collectées</h3>
              <p className="text-muted-foreground mb-2">Nous collectons :</p>
              <h4 className="font-medium mt-3 mb-1">Données d'identification</h4>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Nom, prénom et photo de profil</li>
                <li>Adresse email et numéro de téléphone</li>
                <li>Type d'utilisateur</li>
              </ul>
              <h4 className="font-medium mt-3 mb-1">Données de localisation</h4>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Ville et pays</li>
                <li>Localisation approximative pour les annonces</li>
              </ul>
              <h4 className="font-medium mt-3 mb-1">Données relatives aux véhicules</h4>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Photos et caractéristiques techniques</li>
                <li>Prix et conditions</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Finalités du traitement</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Créer et gérer votre compte</li>
                <li>Publier et gérer vos annonces</li>
                <li>Faciliter les transactions entre utilisateurs</li>
                <li>Traiter les paiements pour les services premium</li>
                <li>Améliorer nos services</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Durée de conservation</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Données de compte actif : tant que votre compte est actif</li>
                <li>Données de compte inactif : supprimées après 3 ans d'inactivité</li>
                <li>Données de transaction : conservées 10 ans (obligations comptables)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Vos droits RGPD</h3>
              <p className="text-muted-foreground mb-2">Vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Droit d'accès : obtenir une copie de vos données</li>
                <li>Droit de rectification : corriger des données inexactes</li>
                <li>Droit à l'effacement : demander la suppression de vos données</li>
                <li>Droit à la portabilité : recevoir vos données dans un format structuré</li>
                <li>Droit d'opposition : vous opposer au traitement</li>
                <li>Droit de réclamation : déposer une plainte auprès de la CNIL</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Pour exercer vos droits : <strong>privacy@carflex.app</strong>
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Sécurité des données</h3>
              <p className="text-muted-foreground mb-2">Nous mettons en œuvre :</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Chiffrement des données sensibles (SSL/TLS)</li>
                <li>Authentification sécurisée</li>
                <li>Contrôles d'accès stricts</li>
                <li>Sauvegardes régulières</li>
                <li>Politiques de sécurité au niveau des lignes (RLS)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Partage des données</h3>
              <p className="text-muted-foreground mb-2">Vos données sont partagées avec :</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Autres utilisateurs (informations publiques des annonces)</li>
                <li>Stripe (pour le traitement des paiements)</li>
                <li>Services d'hébergement cloud sécurisés</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Contact</h3>
              <p className="text-muted-foreground">
                Email : <strong>privacy@carflex.app</strong>
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
