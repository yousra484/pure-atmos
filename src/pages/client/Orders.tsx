import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Clock, CheckCircle, XCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  titre: string;
  statut: string;
  created_at: string;
  type_analyse: string;
  lieu_intervention: string;
  budget_estime: string;
  delai_souhaite: string;
  description?: string;
}


export default function Orders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrdersAndMissions();
    }
  }, [user]);

  const fetchOrdersAndMissions = async () => {
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) return;

      // Fetch study requests (demandes_etudes) as orders
      const { data: ordersData } = await supabase
        .from('demandes_etudes')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      // Transform demandes_etudes to match Order interface
      const transformedOrders = ordersData?.map(demande => ({
        id: demande.id,
        titre: demande.nom_entreprise || `Analyse ${demande.type_etude}`,
        statut: demande.statut || 'en_attente',
        created_at: demande.created_at,
        type_analyse: demande.type_etude,
        lieu_intervention: demande.zone_geographique,
        budget_estime: demande.budget_estime,
        delai_souhaite: demande.delai_souhaite,
        description: demande.description_projet
      })) || [];

      // For now, we'll keep missions empty since they're linked to commandes table
      // In a real scenario, you might want to create missions when demandes_etudes are accepted
      setOrders(transformedOrders);
      //setMissions([]);
    } catch (error) {
      console.error('Error fetching orders and missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'en_attente': { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      'acceptée': { label: 'Acceptée', variant: 'default' as const, icon: CheckCircle },
      'en_cours': { label: 'En cours', variant: 'default' as const, icon: Clock },
      'terminée': { label: 'Terminée', variant: 'default' as const, icon: CheckCircle },
      'annulée': { label: 'Annulée', variant: 'destructive' as const, icon: XCircle },
      'refusée': { label: 'Refusée', variant: 'destructive' as const, icon: XCircle },
    };
    return statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: Clock 
    };
  };

  const getBudgetDisplay = (budget: string) => {
    switch (budget) {
      case 'moins_10k':
        return 'Moins de 10,000 DA';
      case '10k_50k':
        return '10,000 - 50,000 DA';
      case '50k_100k':
        return '50,000 - 100,000 DA';
      case '100k_500k':
        return '100,000 - 500,000 DA';
      case 'plus_500k':
        return 'Plus de 500,000 DA';
      case 'a_discuter':
        return 'À discuter';
      default:
        return budget || 'Non spécifié';
    }
  };

  const getDelayDisplay = (delay: string) => {
    switch (delay) {
      case 'urgent':
        return 'Urgent (1-2 semaines)';
      case '1_mois':
        return '1 mois';
      case '3_mois':
        return '3 mois';
      case '6_mois':
        return '6 mois';
      case 'flexible':
        return 'Flexible';
      default:
        return delay || 'Non spécifié';
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    
    try {
      const { error } = await supabase
        .from('demandes_etudes')
        .update({ statut: 'annulée' })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, statut: 'annulée' }
            : order
        )
      );

      toast({
        title: "Commande annulée",
        description: "Votre commande a été annulée avec succès.",
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation de la commande.",
        variant: "destructive",
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

  const canCancelOrder = (status: string) => {
    return status === 'en_attente' || status === 'accepte';
  };

  const getMissionsForOrder = (orderId: string) => {
    return missions.filter(m => m.commande_id === orderId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Mes Commandes</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes Commandes</h1>
        <p className="text-muted-foreground">
          Suivez l'état de vos commandes et missions en temps réel
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
         
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Aucune commande trouvée</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = getStatusBadge(order.statut);
                const StatusIcon = status.icon;
                //const orderMissions = getMissionsForOrder(order.id);
                
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{order.titre}</CardTitle>
                          <CardDescription>
                            Créée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </CardDescription>
                          <div className="text-sm text-muted-foreground mt-2">
                            <p><strong>Type:</strong> {order.type_analyse}</p>
                            <p><strong>Lieu:</strong> {order.lieu_intervention}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={status.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          {canCancelOrder(order.statut) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <X className="w-4 h-4 mr-1" />
                                  Annuler
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Annuler la commande</DialogTitle>
                                  <DialogDescription>
                                    Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Commande :</strong> {order.titre}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Type :</strong> {order.type_analyse}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Statut actuel :</strong> {status.label}
                                  </p>
                                </div>
                                <DialogFooter>
                                  <DialogTrigger asChild>
                                    <Button variant="outline">Garder la commande</Button>
                                  </DialogTrigger>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleCancelOrder(order.id)}
                                    disabled={cancellingOrderId === order.id}
                                  >
                                    {cancellingOrderId === order.id ? "Annulation..." : "Confirmer l'annulation"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Budget estimé:</span>
                            <p className="mt-1">{getBudgetDisplay(order.budget_estime)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Délai souhaité:</span>
                            <p className="mt-1">{getDelayDisplay(order.delai_souhaite)}</p>
                          </div>
                        </div>
                        {order.description && (
                          <div>
                            <span className="font-medium text-muted-foreground">Description:</span>
                            <p className="mt-1 text-sm">{order.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        
      </Tabs>
    </div>
  );
}