import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Conditions Générales d'Utilisation</DialogTitle>
          <DialogDescription>
            Dernière mise à jour : 15 octobre 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Acceptation des conditions</h3>
              <p className="text-muted-foreground">
                En accédant et en utilisant CarFlex (ci-après "la Plateforme"), vous acceptez d'être lié par les 
                présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, 
                veuillez ne pas utiliser la Plateforme.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Description du service</h3>
              <p className="text-muted-foreground mb-2">
                CarFlex est une plateforme en ligne permettant aux utilisateurs de :
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Acheter et vendre des véhicules d'occasion</li>
                <li>Louer des véhicules</li>
                <li>Évaluer la valeur de leur véhicule grâce à notre outil d'estimation IA</li>
                <li>Promouvoir leurs annonces via des services premium</li>
                <li>Communiquer avec d'autres utilisateurs via notre système de messagerie</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Inscription et compte utilisateur</h3>
              <h4 className="font-medium mt-3 mb-1">3.1 Création de compte</h4>
              <p className="text-muted-foreground mb-2">
                Pour utiliser certaines fonctionnalités de la Plateforme, vous devez créer un compte en fournissant 
                des informations exactes, complètes et à jour.
              </p>
              <h4 className="font-medium mt-3 mb-1">3.2 Sécurité du compte</h4>
              <p className="text-muted-foreground mb-2">
                Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les 
                activités effectuées sous votre compte.
              </p>
              <h4 className="font-medium mt-3 mb-1">3.3 Conditions d'éligibilité</h4>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Vous devez avoir au moins 18 ans</li>
                <li>Vous devez avoir la capacité juridique de conclure des contrats</li>
                <li>Vous ne devez pas être interdit d'utiliser nos services</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Responsabilités des utilisateurs</h3>
              <h4 className="font-medium mt-3 mb-1">4.1 Publication d'annonces</h4>
              <p className="text-muted-foreground text-sm mb-2">En publiant une annonce, vous vous engagez à :</p>
              <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                <li>Fournir des informations exactes et complètes sur le véhicule</li>
                <li>Être le propriétaire légitime du véhicule ou disposer de l'autorisation nécessaire</li>
                <li>Ne pas publier de contenu frauduleux, trompeur ou illégal</li>
                <li>Utiliser uniquement des photos authentiques du véhicule concerné</li>
              </ul>
              <h4 className="font-medium mt-3 mb-1">4.2 Comportement interdit</h4>
              <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1 mb-3">
                <li>Usurper l'identité d'une autre personne</li>
                <li>Harceler, menacer ou intimider d'autres utilisateurs</li>
                <li>Publier du contenu offensant, diffamatoire ou discriminatoire</li>
                <li>Utiliser la Plateforme à des fins frauduleuses ou illégales</li>
              </ul>
              <h4 className="font-medium mb-1">4.3 Politique de Tolérance Zéro</h4>
              <p className="text-muted-foreground text-sm mb-2">
                CarFlex applique une <strong>politique de TOLÉRANCE ZÉRO</strong> envers les contenus inappropriés, 
                les comportements abusifs et toute violation des règles de la communauté.
              </p>
              <p className="text-muted-foreground text-sm">
                Tout contenu signalé sera examiné dans un délai de <strong>24 heures maximum</strong>. 
                Les utilisateurs en infraction seront bannis immédiatement. Pour plus de détails, 
                consultez la section 8.1.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Services premium et paiements</h3>
              <p className="text-muted-foreground mb-2">
                CarFlex propose des services premium pour augmenter la visibilité de vos annonces.
                Les paiements sont traités de manière sécurisée via Stripe. Tous les paiements sont définitifs 
                et non remboursables, sauf en cas d'erreur technique de notre part.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Limitation de responsabilité</h3>
              <p className="text-muted-foreground mb-2">
                CarFlex agit uniquement comme intermédiaire entre utilisateurs. Nous ne sommes pas responsables :
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>De l'exactitude des informations publiées par les utilisateurs</li>
                <li>De la qualité, la sécurité ou la légalité des véhicules proposés</li>
                <li>Des transactions entre utilisateurs</li>
                <li>Des litiges entre acheteurs et vendeurs</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Modération et suspension</h3>
              
              <h4 className="font-medium mt-3 mb-1">7.1 Politique de tolérance zéro</h4>
              <p className="text-muted-foreground text-sm mb-2">
                CarFlex applique une politique de tolérance zéro concernant :
              </p>
              <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1 mb-2">
                <li>Le contenu inapproprié, offensant ou illégal</li>
                <li>Les comportements abusifs envers d'autres utilisateurs</li>
                <li>Toute violation des règles de la communauté</li>
              </ul>
              <p className="text-muted-foreground text-sm mb-3">
                Tout contenu signalé sera examiné et supprimé dans un délai de 24 heures maximum. 
                L'utilisateur responsable du contenu inapproprié sera immédiatement banni de la plateforme.
              </p>

              <p className="text-muted-foreground text-sm">
                CarFlex se réserve le droit de supprimer toute annonce non conforme aux présentes CGU, 
                de suspendre ou résilier un compte en cas de violation des CGU.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Contact</h3>
              <p className="text-muted-foreground">
                Email : <strong>support@carflex.app</strong>
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
