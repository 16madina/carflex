import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : 15 octobre 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              CarFlex s'engage à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité 
              explique comment nous collectons, utilisons, partageons et protégeons vos informations personnelles conformément 
              au Règlement Général sur la Protection des Données (RGPD) et aux lois applicables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Responsable du traitement</h2>
            <p className="text-muted-foreground mb-4">
              Le responsable du traitement des données est CarFlex, accessible via notre plateforme web et mobile.
            </p>
            <p className="text-muted-foreground mb-4">
              Pour toute question relative à vos données personnelles, vous pouvez nous contacter à : 
              <strong> privacy@carflex.app</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Données collectées</h2>
            <p className="text-muted-foreground mb-4">Nous collectons les types de données suivants :</p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Données d'identification</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Photo de profil (optionnel)</li>
              <li>Type d'utilisateur (particulier, vendeur, concessionnaire, agent)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Données de localisation</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Ville et pays</li>
              <li>Localisation approximative pour les annonces</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Données relatives aux véhicules</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Photos des véhicules</li>
              <li>Caractéristiques techniques (marque, modèle, année, kilométrage, etc.)</li>
              <li>Prix et conditions de vente/location</li>
              <li>Historique d'entretien (si fourni)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Données de transaction</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Historique des achats de services premium (via Stripe)</li>
              <li>Informations de paiement (traitées par Stripe, nous ne stockons pas vos données bancaires)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.5 Données de navigation</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Adresse IP</li>
              <li>Type de navigateur et appareil</li>
              <li>Pages visitées et temps passé sur la plateforme</li>
              <li>Recherches effectuées</li>
              <li>Annonces favorites</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Finalités et bases légales du traitement</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">4.1 Exécution du contrat</h3>
              <p className="text-muted-foreground mb-2">Nous utilisons vos données pour :</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Créer et gérer votre compte</li>
                <li>Publier et gérer vos annonces</li>
                <li>Faciliter les transactions entre acheteurs et vendeurs</li>
                <li>Traiter les paiements pour les services premium</li>
                <li>Vous envoyer des notifications relatives à votre compte et vos annonces</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">4.2 Intérêt légitime</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Améliorer nos services et l'expérience utilisateur</li>
                <li>Prévenir la fraude et assurer la sécurité de la plateforme</li>
                <li>Analyser les performances de nos annonces</li>
                <li>Vous envoyer des recommandations personnalisées</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">4.3 Consentement</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Communication marketing (newsletters, offres promotionnelles)</li>
                <li>Utilisation de cookies non essentiels</li>
                <li>Partage de données avec des partenaires tiers (avec votre accord explicite)</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">4.4 Obligation légale</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Répondre aux demandes des autorités compétentes</li>
                <li>Respecter nos obligations fiscales et comptables</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Durée de conservation</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li><strong>Données de compte actif :</strong> Conservées tant que votre compte est actif</li>
              <li><strong>Données de compte inactif :</strong> Supprimées après 3 ans d'inactivité</li>
              <li><strong>Données d'annonces supprimées :</strong> Conservées 1 an pour des raisons légales</li>
              <li><strong>Données de transaction :</strong> Conservées 10 ans conformément aux obligations comptables</li>
              <li><strong>Cookies :</strong> 13 mois maximum</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Partage des données</h2>
            <p className="text-muted-foreground mb-4">Nous partageons vos données uniquement dans les cas suivants :</p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Avec d'autres utilisateurs</h3>
            <p className="text-muted-foreground mb-4">
              Lorsque vous publiez une annonce, certaines informations (nom, ville, photo de profil) sont visibles 
              par les autres utilisateurs pour faciliter le contact.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Prestataires de services</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li><strong>Stripe :</strong> Pour le traitement des paiements</li>
              <li><strong>Hébergement :</strong> Pour stocker vos données en toute sécurité</li>
              <li><strong>Services cloud :</strong> Pour le stockage des photos</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Obligations légales</h3>
            <p className="text-muted-foreground mb-4">
              Nous pouvons divulguer vos données si la loi l'exige ou en réponse à une demande légale des autorités.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Vos droits RGPD</h2>
            <p className="text-muted-foreground mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
            
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-3">
              <li>
                <strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles
              </li>
              <li>
                <strong>Droit de rectification :</strong> Corriger des données inexactes ou incomplètes
              </li>
              <li>
                <strong>Droit à l'effacement :</strong> Demander la suppression de vos données
              </li>
              <li>
                <strong>Droit à la limitation :</strong> Limiter le traitement de vos données
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré
              </li>
              <li>
                <strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données
              </li>
              <li>
                <strong>Droit de retirer votre consentement :</strong> À tout moment
              </li>
              <li>
                <strong>Droit de réclamation :</strong> Déposer une plainte auprès de la CNIL
              </li>
            </ul>

            <p className="text-muted-foreground mb-4 mt-6">
              Pour exercer vos droits, contactez-nous à : <strong>privacy@carflex.app</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Sécurité des données</h2>
            <p className="text-muted-foreground mb-4">Nous mettons en œuvre des mesures de sécurité appropriées :</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Chiffrement des données sensibles (SSL/TLS)</li>
              <li>Authentification sécurisée des utilisateurs</li>
              <li>Contrôles d'accès stricts aux données</li>
              <li>Sauvegardes régulières</li>
              <li>Surveillance et détection des incidents de sécurité</li>
              <li>Politiques de sécurité au niveau des lignes (RLS) dans notre base de données</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Cookies et technologies similaires</h2>
            <p className="text-muted-foreground mb-4">Nous utilisons les cookies suivants :</p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">9.1 Cookies essentiels</h3>
            <p className="text-muted-foreground mb-4">
              Nécessaires au fonctionnement de la plateforme (authentification, préférences de langue).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.2 Cookies de performance</h3>
            <p className="text-muted-foreground mb-4">
              Pour analyser l'utilisation de la plateforme et améliorer nos services.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.3 Cookies de personnalisation</h3>
            <p className="text-muted-foreground mb-4">
              Pour mémoriser vos préférences et vous offrir une expérience personnalisée.
            </p>

            <p className="text-muted-foreground mb-4 mt-6">
              Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Transferts internationaux</h2>
            <p className="text-muted-foreground mb-4">
              Vos données sont hébergées dans des centres de données sécurisés. Si nous transférons vos données 
              en dehors de l'Espace Économique Européen (EEE), nous nous assurons que des garanties appropriées 
              sont en place (clauses contractuelles types, Privacy Shield, etc.).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Modifications de cette politique</h2>
            <p className="text-muted-foreground mb-4">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
              Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour. 
              Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
            <p className="text-muted-foreground mb-4">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
            </p>
            <ul className="list-none text-muted-foreground mb-4 space-y-2">
              <li><strong>Email :</strong> privacy@carflex.app</li>
              <li><strong>Support :</strong> support@carflex.app</li>
            </ul>
          </section>

          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-muted-foreground">
              Cette politique de confidentialité est conforme au RGPD (Règlement UE 2016/679) et aux lois 
              applicables en matière de protection des données personnelles.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default PrivacyPolicy;
