import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Flag, Shield, Ban, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Foire aux questions</h1>
          <p className="text-muted-foreground text-lg">
            Politique de modération et processus de signalement
          </p>
        </div>

        <div className="space-y-8">
          {/* Politique de modération */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Politique de modération</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Qu'est-ce que la politique de tolérance zéro ?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    CarFlex applique une <strong>politique de tolérance zéro</strong> concernant :
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Les contenus inappropriés, offensants, pornographiques ou illégaux</li>
                    <li>Les utilisateurs abusifs, harcelants ou menaçants</li>
                    <li>Les arnaques, fraudes et comportements frauduleux</li>
                    <li>Les contenus protégés par des droits d'auteur publiés sans autorisation</li>
                    <li>Les discours haineux, discriminatoires ou incitant à la violence</li>
                  </ul>
                  <p className="mt-3 text-sm">
                    Toute violation de ces règles entraîne un bannissement immédiat sans préavis ni possibilité de remboursement.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Quel est le délai de traitement des signalements ?</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="mb-2">
                        Notre équipe de modération examine tous les contenus signalés dans un délai 
                        de <strong>24 heures maximum</strong>.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Les cas les plus graves sont traités en priorité et peuvent être résolus 
                        en quelques heures seulement.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Que se passe-t-il après un signalement ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Processus de modération :</p>
                    <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                      <li><strong>Réception :</strong> Votre signalement est enregistré immédiatement</li>
                      <li><strong>Examen :</strong> Notre équipe vérifie le contenu signalé sous 24h</li>
                      <li><strong>Décision :</strong> Si la violation est confirmée, le contenu est supprimé</li>
                      <li><strong>Sanction :</strong> L'utilisateur responsable est banni de la plateforme</li>
                    </ol>
                    <p className="text-sm mt-3">
                      Vous recevrez une notification une fois que votre signalement aura été traité.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Les signalements sont-ils anonymes ?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    Oui, votre identité reste <strong>confidentielle</strong>. L'utilisateur signalé 
                    ne connaîtra jamais votre identité.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Seule notre équipe de modération a accès aux informations du signalement pour 
                    pouvoir traiter votre demande efficacement.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Processus de signalement */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Flag className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Processus de signalement</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-5">
                <AccordionTrigger>Comment signaler une annonce inappropriée ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Pour signaler une annonce (vente ou location) :</p>
                    <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                      <li>Ouvrez la page de l'annonce concernée</li>
                      <li>Cliquez sur le bouton <strong>"Signaler"</strong> en haut à droite</li>
                      <li>Sélectionnez la raison du signalement dans la liste proposée</li>
                      <li>Ajoutez une description (optionnel mais recommandé)</li>
                      <li>Validez votre signalement</li>
                    </ol>
                    <div className="bg-muted p-3 rounded-lg mt-3">
                      <p className="text-sm">
                        💡 <strong>Conseil :</strong> Plus votre description est précise, plus nous pourrons 
                        traiter votre signalement rapidement.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>Comment signaler un message inapproprié ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Pour signaler un message dans une conversation :</p>
                    <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                      <li>Ouvrez la conversation concernée dans l'onglet Messages</li>
                      <li>Appuyez longuement sur le message à signaler</li>
                      <li>Sélectionnez <strong>"Signaler ce message"</strong></li>
                      <li>Choisissez la raison du signalement</li>
                      <li>Confirmez votre signalement</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>Quelles sont les raisons de signalement disponibles ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p className="mb-3">Vous pouvez signaler un contenu pour les raisons suivantes :</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                        <span><strong>Contenu inapproprié :</strong> contenu offensant, vulgaire ou choquant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                        <span><strong>Arnaque :</strong> tentative de fraude ou d'escroquerie</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                        <span><strong>Spam :</strong> publicité non sollicitée ou contenu répétitif</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                        <span><strong>Fausse information :</strong> informations trompeuses sur le véhicule</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                        <span><strong>Harcèlement :</strong> comportement abusif ou menaçant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                        <span><strong>Autre :</strong> pour toute autre violation des règles</span>
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Bloquer un utilisateur */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Ban className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Bloquer un utilisateur</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-8">
                <AccordionTrigger>Comment bloquer un utilisateur ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Pour bloquer un utilisateur abusif :</p>
                    <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                      <li>Rendez-vous sur le profil de l'utilisateur</li>
                      <li>Cliquez sur le bouton <strong>"Bloquer cet utilisateur"</strong></li>
                      <li>Confirmez votre choix dans la boîte de dialogue</li>
                    </ol>
                    <div className="bg-muted p-3 rounded-lg mt-3">
                      <p className="text-sm mb-2">
                        <strong>Que se passe-t-il lorsque vous bloquez quelqu'un ?</strong>
                      </p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Vous ne recevrez plus de messages de cette personne</li>
                        <li>• Vous ne verrez plus ses annonces</li>
                        <li>• Cette personne ne pourra plus voir vos annonces</li>
                        <li>• Le blocage est réversible à tout moment</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger>Puis-je débloquer un utilisateur ?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    Oui, vous pouvez débloquer un utilisateur à tout moment depuis vos paramètres.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rendez-vous dans <strong>Profil → Paramètres → Utilisateurs bloqués</strong> 
                    pour gérer votre liste d'utilisateurs bloqués.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Contact */}
          <section className="border-t pt-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Besoin d'aide supplémentaire ?</h2>
            <p className="text-muted-foreground mb-4">
              Si vous avez d'autres questions ou si vous rencontrez un problème particulier, 
              n'hésitez pas à contacter notre équipe de support :
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium mb-2">Support CarFlex</p>
              <p className="text-sm text-muted-foreground">
                Email : <a href="mailto:support@carflex.app" className="text-primary hover:underline">
                  support@carflex.app
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FAQ;
