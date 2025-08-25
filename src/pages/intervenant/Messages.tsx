import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Users, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  expediteur_id: string;
  destinataire_id: string;
  contenu: string;
  lu: boolean;
  created_at: string;
  expediteur?: {
    nom: string;
    prenom: string;
    type_compte: string;
  };
  destinataire?: {
    nom: string;
    prenom: string;
    type_compte: string;
  };
}

interface TeamMember {
  id: string;
  nom: string;
  prenom: string;
  type_compte: string;
  user_id: string;
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<TeamMember | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel('messages')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchData = async () => {
    try {
      if (!user?.id) return;

      // Get current user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;
      setCurrentProfile(profile);

      // Fetch team members (all profiles except current user)
      const { data: teamData, error: teamError } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .order('nom');

      if (teamError) throw teamError;
      setTeamMembers(teamData || []);

      // Fetch messages
      await fetchMessages();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      if (!user?.id) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Fetch messages where user is sender or recipient
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          expediteur:expediteur_id(nom, prenom, type_compte),
          destinataire:destinataire_id(nom, prenom, type_compte)
        `)
        .or(`expediteur_id.eq.${profile.id},destinataire_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedRecipient || !newMessage.trim() || !currentProfile) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          expediteur_id: currentProfile.id,
          destinataire_id: selectedRecipient.id,
          contenu: newMessage.trim(),
          lu: false,
        });

      if (error) throw error;

      toast({
        title: "Message envoyé",
        description: `Message envoyé à ${selectedRecipient.prenom} ${selectedRecipient.nom}`,
      });

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ lu: true })
        .eq('id', messageId);
      
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getConversationMessages = (recipientId: string) => {
    if (!currentProfile) return [];
    
    return messages.filter(msg => 
      (msg.expediteur_id === currentProfile.id && msg.destinataire_id === recipientId) ||
      (msg.expediteur_id === recipientId && msg.destinataire_id === currentProfile.id)
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const getUnreadCount = (recipientId: string) => {
    if (!currentProfile) return 0;
    
    return messages.filter(msg => 
      msg.expediteur_id === recipientId && 
      msg.destinataire_id === currentProfile.id && 
      !msg.lu
    ).length;
  };

  const getRoleColor = (type_compte: string) => {
    switch (type_compte) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'intervention': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Messagerie Équipe</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-1 flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messagerie Équipe</h1>
        <p className="text-muted-foreground">
          Communiquez avec votre équipe en temps réel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Équipe
            </CardTitle>
            <CardDescription>
              Sélectionnez un membre pour commencer une conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {teamMembers.map((member) => {
                  const unreadCount = getUnreadCount(member.id);
                  
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRecipient?.id === member.id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedRecipient(member)}
                    >
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {member.prenom[0]}{member.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {member.prenom} {member.nom}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getRoleColor(member.type_compte)}`}
                        >
                          {member.type_compte}
                        </Badge>
                      </div>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedRecipient ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conversation avec {selectedRecipient.prenom} {selectedRecipient.nom}
                </CardTitle>
                <CardDescription>
                  <Badge className={getRoleColor(selectedRecipient.type_compte)}>
                    {selectedRecipient.type_compte}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Messages */}
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {getConversationMessages(selectedRecipient.id).map((message) => {
                        const isFromMe = message.expediteur_id === currentProfile?.id;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                isFromMe
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                              onClick={() => !isFromMe && !message.lu && markAsRead(message.id)}
                            >
                              <p className="text-sm">{message.contenu}</p>
                              <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                                <span>
                                  {new Date(message.created_at).toLocaleString('fr-FR')}
                                </span>
                                {isFromMe && (
                                  <div className="flex items-center ml-2">
                                    {message.lu ? (
                                      <CheckCircle2 className="w-3 h-3" />
                                    ) : (
                                      <Clock className="w-3 h-3" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <Separator />

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      rows={2}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un membre de l'équipe pour commencer une conversation</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
