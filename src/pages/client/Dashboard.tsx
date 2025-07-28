import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, FileText, Clock, DollarSign, User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedReports: number;
  pendingInvoices: number;
  totalAmount: number;
  totalDays: number;
}

interface UserProfile {
  nom: string;
  prenom: string;
}

interface Invoice {
  id: string;
  montant: number;
  date_emission: string;
  statut: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeOrders: 0,
    completedReports: 0,
    pendingInvoices: 0,
    totalAmount: 0,
    totalDays: 0,
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile with nom and prenom
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, nom, prenom')
        .eq('user_id', user?.id)
        .single();

      if (!profile) return;

      setUserProfile({ nom: profile.nom, prenom: profile.prenom });

      // Fetch demandes d'études to calculate total days
      const { data: demandes } = await supabase
        .from('demandes_etudes')
        .select('delai_souhaite')
        .eq('client_id', profile.id);

      // Calculate total days from demandes
      const totalDays = demandes?.reduce((acc, demande) => {
        const delai = demande.delai_souhaite;
        if (delai?.includes('jours')) {
          const days = parseInt(delai.match(/\d+/)?.[0] || '0');
          return acc + days;
        } else if (delai?.includes('semaines')) {
          const weeks = parseInt(delai.match(/\d+/)?.[0] || '0');
          return acc + (weeks * 7);
        } else if (delai?.includes('mois')) {
          const months = parseInt(delai.match(/\d+/)?.[0] || '0');
          return acc + (months * 30);
        }
        return acc;
      }, 0) || 0;

      // Fetch orders statistics
      const { data: orders } = await supabase
        .from('commandes')
        .select('*')
        .eq('client_id', profile.id);

      // Fetch reports count
      const { data: reports } = await supabase
        .from('rapports')
        .select('id')
        .in('commande_id', orders?.map(o => o.id) || []);

      // Fetch all invoices for total amount and history
      const { data: allInvoices } = await supabase
        .from('factures')
        .select('*')
        .in('commande_id', orders?.map(o => o.id) || []);

      // Calculate total amount
      const totalAmount = allInvoices?.reduce((acc, invoice) => {
        return acc + (parseFloat(invoice.montant?.toString() || '0') || 0);
      }, 0) || 0;

      // Pending invoices count
      const pendingInvoicesCount = allInvoices?.filter(inv => inv.statut === 'pending').length || 0;

      setStats({
        totalOrders: orders?.length || 0,
        activeOrders: orders?.filter(o => o.statut === 'en_cours').length || 0,
        completedReports: reports?.length || 0,
        pendingInvoices: pendingInvoicesCount,
        totalAmount,
        totalDays,
      });

      // Set recent orders (last 5)
      setRecentOrders(orders?.slice(-5).reverse() || []);
      
      // Set invoice history (last 10)
      setInvoiceHistory(allInvoices?.slice(-10).reverse() || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'en_attente': { label: 'En attente', variant: 'secondary' as const },
      'en_cours': { label: 'En cours', variant: 'default' as const },
      'termine': { label: 'Terminé', variant: 'default' as const },
      'annule': { label: 'Annulé', variant: 'destructive' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
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
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        {userProfile && (
          <p className="text-lg text-muted-foreground">
            Bienvenue {userProfile.prenom} {userProfile.nom}
          </p>
        )}
        <p className="text-muted-foreground">
          Voici un aperçu de vos activités.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Commandes
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Toutes vos commandes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes Actives
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              En cours de traitement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rapports Disponibles
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedReports}</div>
            <p className="text-xs text-muted-foreground">
              Prêts au téléchargement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Factures En Attente
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              À régler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Montant Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              Total des projets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jours Estimés
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDays}</div>
            <p className="text-xs text-muted-foreground">
              Total des délais
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
            <CardDescription>
              Vos 5 dernières commandes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune commande trouvée
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => {
                  const status = getStatusBadge(order.statut);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{order.titre}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date_creation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle>Historique Facturation</CardTitle>
            <CardDescription>
              Vos dernières factures
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoiceHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune facture trouvée
              </p>
            ) : (
              <div className="space-y-4">
                {invoiceHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{parseFloat(invoice.montant?.toString() || '0').toFixed(2)} €</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date_emission).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge variant={invoice.statut === 'paid' ? 'default' : invoice.statut === 'pending' ? 'secondary' : 'destructive'}>
                      {invoice.statut === 'paid' ? 'Payée' : invoice.statut === 'pending' ? 'En attente' : 'Annulée'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}