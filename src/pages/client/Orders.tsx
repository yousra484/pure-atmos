import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Order {
  id: string;
  titre: string;
  statut: string;
  date_creation: string;
  missions?: Mission[];
}

interface Mission {
  id: string;
  commande_id: string;
  intervenant_id: string;
  statut: string;
  date_debut: string;
  date_fin: string;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

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

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('commandes')
        .select('*')
        .eq('client_id', profile.id)
        .order('date_creation', { ascending: false });

      // Fetch missions for these orders
      const orderIds = ordersData?.map(o => o.id) || [];
      const { data: missionsData } = await supabase
        .from('missions')
        .select('*')
        .in('commande_id', orderIds)
        .order('date_debut', { ascending: false });

      setOrders(ordersData || []);
      setMissions(missionsData || []);
    } catch (error) {
      console.error('Error fetching orders and missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'en_attente': { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      'en_cours': { label: 'En cours', variant: 'default' as const, icon: Clock },
      'termine': { label: 'Terminé', variant: 'default' as const, icon: CheckCircle },
      'annule': { label: 'Annulé', variant: 'destructive' as const, icon: XCircle },
    };
    return statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: Clock 
    };
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
          <TabsTrigger value="missions">Missions</TabsTrigger>
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
                const orderMissions = getMissionsForOrder(order.id);
                
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{order.titre}</CardTitle>
                          <CardDescription>
                            Créée le {new Date(order.date_creation).toLocaleDateString('fr-FR')}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={status.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Détails
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {orderMissions.length > 0 && (
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Missions associées:</h4>
                          <div className="grid gap-2">
                            {orderMissions.map((mission) => {
                              const missionStatus = getStatusBadge(mission.statut);
                              const MissionIcon = missionStatus.icon;
                              
                              return (
                                <div key={mission.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">Mission #{mission.id.slice(0, 8)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {mission.date_debut && `Début: ${new Date(mission.date_debut).toLocaleDateString('fr-FR')}`}
                                      {mission.date_fin && ` - Fin: ${new Date(mission.date_fin).toLocaleDateString('fr-FR')}`}
                                    </p>
                                  </div>
                                  <Badge variant={missionStatus.variant} className="text-xs">
                                    <MissionIcon className="w-3 h-3 mr-1" />
                                    {missionStatus.label}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="missions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les Missions</CardTitle>
              <CardDescription>
                Vue d'ensemble de toutes vos missions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune mission trouvée
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mission</TableHead>
                      <TableHead>Commande</TableHead>
                      <TableHead>Date début</TableHead>
                      <TableHead>Date fin</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missions.map((mission) => {
                      const order = orders.find(o => o.id === mission.commande_id);
                      const status = getStatusBadge(mission.statut);
                      const StatusIcon = status.icon;
                      
                      return (
                        <TableRow key={mission.id}>
                          <TableCell className="font-medium">
                            #{mission.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>{order?.titre || 'N/A'}</TableCell>
                          <TableCell>
                            {mission.date_debut ? 
                              new Date(mission.date_debut).toLocaleDateString('fr-FR') : 
                              'Non définie'
                            }
                          </TableCell>
                          <TableCell>
                            {mission.date_fin ? 
                              new Date(mission.date_fin).toLocaleDateString('fr-FR') : 
                              'En cours'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}