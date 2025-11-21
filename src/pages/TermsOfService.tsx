import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-4xl font-bold mb-4">Conditions Générales d'Utilisation</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : 15 octobre 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptation des conditions</h2>
            <p className="text-muted-foreground mb-4">
              En accédant et en utilisant CarFlex (ci-après "la Plateforme"), vous acceptez d'être lié par les 
              présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, 
              veuillez ne pas utiliser la Plateforme.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description du service</h2>
            <p className="text-muted-foreground mb-4">
              CarFlex est une plateforme en ligne permettant aux utilisateurs de :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Acheter et vendre des véhicules d'occasion</li>
              <li>Louer des véhicules</li>
              <li>Évaluer la valeur de leur véhicule grâce à notre outil d'estimation IA</li>
              <li>Promouvoir leurs annonces via des services premium</li>
              <li>Communiquer avec d'autres utilisateurs via notre système de messagerie</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Inscription et compte utilisateur</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Création de compte</h3>
            <p className="text-muted-foreground mb-4">
              Pour utiliser certaines fonctionnalités de la Plateforme, vous devez créer un compte en fournissant 
              des informations exactes, complètes et à jour.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Sécurité du compte</h3>
            <p className="text-muted-foreground mb-4">
              Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les 
              activités effectuées sous votre compte. Vous devez nous informer immédiatement de toute utilisation 
              non autorisée de votre compte.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Conditions d'éligibilité</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Vous devez avoir au moins 18 ans</li>
              <li>Vous devez avoir la capacité juridique de conclure des contrats</li>
              <li>Vous ne devez pas être interdit d'utiliser nos services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Responsabilités des utilisateurs</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Publication d'annonces</h3>
            <p className="text-muted-foreground mb-4">En publiant une annonce, vous vous engagez à :</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Fournir des informations exactes et complètes sur le véhicule</li>
              <li>Être le propriétaire légitime du véhicule ou disposer de l'autorisation nécessaire</li>
              <li>Ne pas publier de contenu frauduleux, trompeur ou illégal</li>
              <li>Utiliser uniquement des photos authentiques du véhicule concerné</li>
              <li>Respecter les lois applicables en matière de vente de véhicules</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Comportement interdit</h3>
            <p className="text-muted-foreground mb-4">Il est strictement interdit de :</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Usurper l'identité d'une autre personne ou entité</li>
              <li>Harceler, menacer ou intimider d'autres utilisateurs</li>
              <li>Publier du contenu offensant, diffamatoire ou discriminatoire</li>
              <li>Utiliser la Plateforme à des fins frauduleuses ou illégales</li>
              <li>Tenter d'accéder aux comptes d'autres utilisateurs</li>
              <li>Utiliser des robots, scripts ou outils automatisés</li>
              <li>Perturber le fonctionnement de la Plateforme</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Transactions</h3>
            <p className="text-muted-foreground mb-4">
              CarFlex facilite la mise en relation entre acheteurs et vendeurs, mais n'est pas partie aux transactions. 
              Les utilisateurs sont responsables de :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Vérifier l'état et la légalité du véhicule</li>
              <li>Négocier les conditions de vente ou de location</li>
              <li>Effectuer les démarches administratives nécessaires</li>
              <li>Respecter les engagements pris</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Services premium et paiements</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Services payants</h3>
            <p className="text-muted-foreground mb-4">
              CarFlex propose des services premium pour augmenter la visibilité de vos annonces :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Mise en avant de l'annonce pendant 7 ou 30 jours</li>
              <li>Badge "Premium" sur l'annonce</li>
              <li>Positionnement prioritaire dans les résultats de recherche</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Tarification</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Premium 7 jours : 5 000 FCFA</li>
              <li>Premium 30 jours : 15 000 FCFA</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Modalités de paiement</h3>
            <p className="text-muted-foreground mb-4">
              Les paiements sont traités de manière sécurisée via Stripe. Tous les paiements sont définitifs 
              et non remboursables, sauf en cas d'erreur technique de notre part.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Propriété intellectuelle</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Contenu de la Plateforme</h3>
            <p className="text-muted-foreground mb-4">
              Tous les éléments de la Plateforme (design, logo, textes, graphiques, code source) sont la 
              propriété exclusive de CarFlex et sont protégés par les lois sur la propriété intellectuelle.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Contenu utilisateur</h3>
            <p className="text-muted-foreground mb-4">
              En publiant du contenu sur CarFlex, vous accordez à la Plateforme une licence mondiale, 
              non exclusive et gratuite d'utiliser, reproduire et afficher ce contenu dans le cadre de 
              la fourniture de nos services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Limitation de responsabilité</h2>
            
            <p className="text-muted-foreground mb-4">
              CarFlex agit uniquement comme intermédiaire entre utilisateurs. Nous ne sommes pas responsables :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>De l'exactitude des informations publiées par les utilisateurs</li>
              <li>De la qualité, la sécurité ou la légalité des véhicules proposés</li>
              <li>Des transactions entre utilisateurs</li>
              <li>Des litiges entre acheteurs et vendeurs</li>
              <li>Des dommages directs ou indirects résultant de l'utilisation de la Plateforme</li>
            </ul>

            <p className="text-muted-foreground mb-4 mt-6">
              La Plateforme est fournie "en l'état" sans garantie d'aucune sorte. Nous ne garantissons pas 
              que le service sera ininterrompu, sécurisé ou exempt d'erreurs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Modération et suspension</h2>
            
            <p className="text-muted-foreground mb-4">
              CarFlex se réserve le droit, à sa seule discrétion, de :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Supprimer toute annonce non conforme aux présentes CGU</li>
              <li>Suspendre ou résilier un compte en cas de violation des CGU</li>
              <li>Modifier ou interrompre tout ou partie des services</li>
              <li>Refuser l'accès à la Plateforme à tout utilisateur</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Protection des données personnelles</h2>
            <p className="text-muted-foreground mb-4">
              L'utilisation de vos données personnelles est régie par notre{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link>
              , que nous vous encourageons à consulter.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Modifications des CGU</h2>
            <p className="text-muted-foreground mb-4">
              Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications entrent en 
              vigueur dès leur publication sur la Plateforme. Votre utilisation continue de CarFlex après 
              ces modifications constitue votre acceptation des nouvelles CGU.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Résiliation</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">11.1 Par l'utilisateur</h3>
            <p className="text-muted-foreground mb-4">
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">11.2 Par CarFlex</h3>
            <p className="text-muted-foreground mb-4">
              Nous pouvons résilier votre compte immédiatement en cas de violation des présentes CGU, 
              sans préavis ni indemnité.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Droit applicable et juridiction</h2>
            <p className="text-muted-foreground mb-4">
              Les présentes CGU sont régies par le droit français. Tout litige relatif à l'interprétation 
              ou à l'exécution des présentes sera soumis aux tribunaux compétents de Paris, sous réserve 
              des règles impératives de compétence.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact</h2>
            <p className="text-muted-foreground mb-4">
              Pour toute question concernant ces Conditions Générales d'Utilisation :
            </p>
            <ul className="list-none text-muted-foreground mb-4 space-y-2">
              <li><strong>Email :</strong> support@carflex.app</li>
              <li><strong>Support client :</strong> Disponible via la plateforme</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Dispositions générales</h2>
            
            <p className="text-muted-foreground mb-4">
              Si une disposition des présentes CGU est jugée invalide ou inapplicable, les autres dispositions 
              resteront en vigueur. Le fait pour CarFlex de ne pas exercer un droit ne constitue pas une 
              renonciation à ce droit.
            </p>
          </section>

          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-muted-foreground">
              En utilisant CarFlex, vous reconnaissez avoir lu, compris et accepté les présentes Conditions 
              Générales d'Utilisation.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default TermsOfService;
