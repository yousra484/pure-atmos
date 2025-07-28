import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  Globe,
  Bot,
  User
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'expert';
  content: string;
  timestamp: Date;
}

export default function Advice() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'expert',
      content: 'Bonjour ! Je suis votre conseiller expert. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const recommendations = [
    {
      icon: TrendingUp,
      title: "Optimisation des coûts",
      description: "Réduisez vos dépenses opérationnelles de 20% avec nos recommandations personnalisées.",
      category: "Finance",
      priority: "high"
    },
    {
      icon: Shield,
      title: "Sécurité renforcée",
      description: "Mettez en place des protocoles de sécurité avancés pour protéger vos données.",
      category: "Sécurité",
      priority: "medium"
    },
    {
      icon: Globe,
      title: "Expansion internationale",
      description: "Explorez de nouveaux marchés avec notre guide d'expansion internationale.",
      category: "Stratégie",
      priority: "low"
    }
  ];

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate expert response
    setTimeout(() => {
      const expertMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'expert',
        content: 'Merci pour votre question. Je vais analyser votre demande et vous proposer des solutions personnalisées. En attendant, je vous recommande de consulter nos recommandations ci-dessous.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, expertMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      'high': { label: 'Haute priorité', variant: 'destructive' as const },
      'medium': { label: 'Priorité moyenne', variant: 'default' as const },
      'low': { label: 'Faible priorité', variant: 'secondary' as const },
    };
    return priorityMap[priority as keyof typeof priorityMap];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Conseils Personnalisés</h1>
        <p className="text-muted-foreground">
          Bénéficiez de recommandations d'experts et chattez avec nos conseillers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recommandations pour vous
              </CardTitle>
              <CardDescription>
                Conseils personnalisés basés sur votre activité et vos besoins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, index) => {
                const Icon = rec.icon;
                const priority = getPriorityBadge(rec.priority);
                
                return (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold">{rec.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant={priority.variant} className="text-xs">
                        {priority.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{rec.category}</Badge>
                      <Button variant="outline" size="sm">
                        En savoir plus
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card>
            <CardHeader>
              <CardTitle>Base de connaissances</CardTitle>
              <CardDescription>
                Articles et guides utiles pour votre secteur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Guide des meilleures pratiques",
                    description: "Les standards de l'industrie expliqués",
                    readTime: "5 min"
                },
                {
                  title: "Tendances du marché 2024",
                  description: "Analyse approfondie des évolutions",
                  readTime: "8 min"
                },
                {
                  title: "Optimisation des processus",
                  description: "Méthodes éprouvées d'amélioration",
                  readTime: "6 min"
                },
                {
                  title: "Gestion des risques",
                  description: "Stratégies de mitigation efficaces",
                  readTime: "7 min"
                }
              ].map((article, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">{article.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {article.readTime} de lecture
                    </span>
                    <Button variant="ghost" size="sm">
                      Lire
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Expert Chat */}
        <div className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat Expert
              </CardTitle>
              <CardDescription>
                Posez vos questions à nos conseillers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 max-h-96">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`flex-1 space-y-1 ${
                      message.type === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`inline-block p-3 rounded-lg max-w-xs ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Input */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Tapez votre question..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isTyping}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}