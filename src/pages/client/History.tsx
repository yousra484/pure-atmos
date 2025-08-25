import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Eye, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Order {
  id: string;
  titre: string;
  statut: string;
  created_at: string;
  type_etude: string;
  zone_geographique: string;
  budget_estime: string;
  delai_souhaite: string;
  description_projet?: string;
}

interface Invoice {
  id: string;
  demande_etude_id: string;
  montant: number;
  statut: string;
  date_emission: string;
  commande?: {
    titre: string;
  };
}

export default function History() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchHistoryData();
    }
  }, [user]);

  useEffect(() => {
    filterData();
  }, [orders, invoices, orderStatusFilter, invoiceStatusFilter, dateFilter]);

  const fetchHistoryData = async () => {
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
        type_etude: demande.type_etude,
        zone_geographique: demande.zone_geographique,
        budget_estime: demande.budget_estime,
        delai_souhaite: demande.delai_souhaite,
        description_projet: demande.description_projet
      })) || [];

      // For invoices, we'll create mock data based on completed orders
      // In a real scenario, invoices would be generated when orders are completed
      const invoicesWithOrders = transformedOrders
        .filter(order => order.statut === 'termine')
        .map(order => ({
          id: `inv_${order.id}`,
          demande_etude_id: order.id,
          montant: getBudgetValue(order.budget_estime),
          statut: 'paid',
          date_emission: order.created_at,
          commande: { titre: order.titre }
        }));

      setOrders(transformedOrders);
      setInvoices(invoicesWithOrders);
    } catch (error) {
      console.error('Error fetching history data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBudgetValue = (budget: string): number => {
    switch (budget) {
      case 'moins_10k':
        return 5000;
      case '10k_50k':
        return 30000;
      case '50k_100k':
        return 75000;
      case '100k_500k':
        return 300000;
      case 'plus_500k':
        return 750000;
      case 'a_discuter':
        return 0;
      default:
        const numericValue = parseFloat(budget?.replace(/[^0-9.,]/g, '')?.replace(',', '.') || '0');
        return isNaN(numericValue) ? 0 : numericValue;
    }
  };

  const filterData = () => {
    let filteredOrdersData = orders;
    let filteredInvoicesData = invoices;

    // Filter by order status
    if (orderStatusFilter !== "all") {
      filteredOrdersData = filteredOrdersData.filter(order => order.statut === orderStatusFilter);
    }

    // Filter by invoice status
    if (invoiceStatusFilter !== "all") {
      filteredInvoicesData = filteredInvoicesData.filter(invoice => invoice.statut === invoiceStatusFilter);
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      let dateThreshold: Date;

      switch (dateFilter) {
        case "week":
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          dateThreshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = new Date(0);
      }

      filteredOrdersData = filteredOrdersData.filter(order => 
        new Date(order.created_at) >= dateThreshold
      );
      filteredInvoicesData = filteredInvoicesData.filter(invoice => 
        new Date(invoice.date_emission) >= dateThreshold
      );
    }

    setFilteredOrders(filteredOrdersData);
    setFilteredInvoices(filteredInvoicesData);
  };

  const getStatusBadge = (status: string, type: 'order' | 'invoice') => {
    if (type === 'order') {
      const statusMap = {
        'en_attente': { label: 'En attente', variant: 'secondary' as const },
        'en_cours': { label: 'En cours', variant: 'default' as const },
        'termine': { label: 'Terminé', variant: 'default' as const },
        'annule': { label: 'Annulé', variant: 'destructive' as const },
      };
      return statusMap[status as keyof typeof statusMap] || { 
        label: status, 
        variant: 'secondary' as const 
      };
    } else {
      const statusMap = {
        'pending': { label: 'En attente', variant: 'secondary' as const },
        'paid': { label: 'Payée', variant: 'default' as const },
        'overdue': { label: 'En retard', variant: 'destructive' as const },
        'cancelled': { label: 'Annulée', variant: 'outline' as const },
      };
      return statusMap[status as keyof typeof statusMap] || { 
        label: status, 
        variant: 'secondary' as const 
      };
    }
  };

  const getTotalAmount = () => {
    return filteredInvoices.reduce((total, invoice) => total + (invoice.montant || 0), 0);
  };

  const getPaidAmount = () => {
    return filteredInvoices
      .filter(invoice => invoice.statut === 'paid')
      .reduce((total, invoice) => total + (invoice.montant || 0), 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Historique</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-8 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historique</h1>
          <p className="text-muted-foreground">
            Consultez l'historique complet de vos commandes et factures
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute période</SelectItem>
              <SelectItem value="week">7 derniers jours</SelectItem>
              <SelectItem value="month">30 derniers jours</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Commandes
                </p>
                <p className="text-2xl font-bold">{filteredOrders.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Montant Total
                </p>
                <p className="text-2xl font-bold">
                  {getTotalAmount().toLocaleString('fr-FR')} DA
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">DA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Montant Payé
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {getPaidAmount().toLocaleString('fr-FR')} DA
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Historique des Commandes</TabsTrigger>
          <TabsTrigger value="invoices">Historique de Facturation</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Commandes ({filteredOrders.length})</h3>
            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="termine">Terminé</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune commande trouvée pour cette période
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const status = getStatusBadge(order.statut, 'order');
                      
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.titre}
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Détails
                            </Button>
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

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Factures ({filteredInvoices.length})</h3>
            <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune facture trouvée pour cette période
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commande</TableHead>
                      <TableHead>Date d'émission</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const status = getStatusBadge(invoice.statut, 'invoice');
                      
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.commande?.titre || 'Commande supprimée'}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.date_emission).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            {(invoice.montant || 0).toLocaleString('fr-FR')} DA
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                Voir
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                PDF
                              </Button>
                            </div>
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