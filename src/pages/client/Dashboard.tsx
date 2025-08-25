import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, FileText, Clock, DollarSign, User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Interface pour les données de demande d'étude
interface DemandeEtude {
  id: string;
  type_etude: string;
  description?: string;
  delai_souhaite: string;
  budget_estime: string | number;
  statut: string;
  created_at: string;
  updated_at: string;
  client_id: string;
}

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
    let isMounted = true;
    let abortController: AbortController | null = new AbortController();

    const loadData = async () => {
      if (!user) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
        }

        // Vérifier si la requête a été annulée
        if (abortController?.signal.aborted) {
          return;
        }

        await fetchDashboardData();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Ne pas mettre à jour l'état si le composant est démonté
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Nettoyage lors du démontage du composant
    return () => {
      isMounted = false;
      abortController?.abort();
      abortController = null;
    };
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (!user?.id) {
        console.error('Aucun utilisateur connecté');
        return;
      }
      
      // Récupération du profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, nom, prenom')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Erreur lors de la récupération du profil:', profileError?.message);
        return;
      }

      setUserProfile({ nom: profile.nom, prenom: profile.prenom });
      
      // Récupération des demandes d'études du client
      const { data: demandes, error: demandesError } = await supabase
        .from('demandes_etudes')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (demandesError) {
        console.error('Erreur lors de la récupération des demandes:', demandesError);
        return;
      }
      
      const typedDemandes = (demandes || []) as DemandeEtude[];
      
      // Calcul des statistiques
      let totalBudget = 0;
      let totalDays = 0;
      let activeOrdersCount = 0;
      let completedOrdersCount = 0;
      let pendingInvoicesCount = 0;
      
      typedDemandes.forEach(demande => {
        // Calcul du budget total
        if (demande.budget_estime) {
          let budget = 0;
          const budgetStr = String(demande.budget_estime);
          
          // Handle budget ranges from the form
          switch (budgetStr) {
            case 'moins_10k':
              budget = 5000; // Average of range
              break;
            case '10k_50k':
              budget = 30000; // Average of range
              break;
            case '50k_100k':
              budget = 75000; // Average of range
              break;
            case '100k_500k':
              budget = 300000; // Average of range
              break;
            case 'plus_500k':
              budget = 750000; // Estimate for above 500k
              break;
            case 'a_discuter':
              budget = 0; // No budget estimate
              break;
            default:
              // Try to parse as numeric value
              const numericBudget = parseFloat(budgetStr.replace(/[^0-9.,]/g, '').replace(',', '.'));
              if (!isNaN(numericBudget)) {
                budget = numericBudget;
              }
              break;
          }
          
          totalBudget += budget;
        }
        
        // Calcul des jours estimés
        if (demande.delai_souhaite) {
          let jours = 0;
          const delaiStr = String(demande.delai_souhaite);
          
          // Handle specific form values
          switch (delaiStr) {
            case 'urgent':
              jours = 10; // 1-2 weeks average
              break;
            case '1_mois':
              jours = 30;
              break;
            case '3_mois':
              jours = 90;
              break;
            case '6_mois':
              jours = 180;
              break;
            case 'flexible':
              jours = 60; // Default estimate for flexible
              break;
            default:
              // Try to parse text descriptions
              const delai = delaiStr.toLowerCase();
              if (delai.includes('jour')) {
                jours = parseInt(delai.replace(/\D/g, '')) || 0;
              } else if (delai.includes('semaine')) {
                const semaines = parseInt(delai.replace(/\D/g, '')) || 0;
                jours = semaines * 7;
              } else if (delai.includes('mois')) {
                const mois = parseInt(delai.replace(/\D/g, '')) || 0;
                jours = mois * 30;
              } else {
                // Try to parse directly as number of days
                jours = parseInt(delai) || 0;
              }
              break;
          }
          
          totalDays += jours;
        }
        
        // Comptage des statuts
        const statut = demande.statut?.toLowerCase() || '';
        if (statut === 'en_cours' || statut === 'en cours' || statut === 'accepté' || statut === 'accepte') {
          activeOrdersCount++;
        } else if (statut === 'terminé' || statut === 'termine' || statut === 'livré' || statut === 'livre') {
          completedOrdersCount++;
        } else if (statut === 'en_attente' || statut === 'en attente' || statut === 'nouveau') {
          pendingInvoicesCount++;
        }
      });

      // Mise à jour des statistiques
      setStats({
        totalOrders: typedDemandes.length,
        activeOrders: activeOrdersCount,
        completedReports: completedOrdersCount,
        pendingInvoices: pendingInvoicesCount,
        totalAmount: Math.round(totalBudget * 100) / 100,
        totalDays: totalDays
      });

      // Mise à jour des commandes récentes (dernières 5)
      const formattedOrders = typedDemandes
        .slice(0, 5)
        .map(demande => ({
          id: demande.id,
          titre: demande.type_etude || 'Étude environnementale',
          date_creation: demande.created_at,
          statut: demande.statut || 'En attente',
          montant: parseFloat(String(demande.budget_estime || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
        }));

      setRecentOrders(formattedOrders);

      // Mise à jour de l'historique des factures (demandes terminées)
      const completedDemandes = typedDemandes.filter(d => {
        const statut = d.statut?.toLowerCase() || '';
        return statut === 'terminé' || statut === 'termine' || statut === 'livré' || statut === 'livre';
      });

      const formattedInvoices = completedDemandes
        .slice(0, 5)
        .map((d, i) => ({
          id: `inv-${d.id}-${i}`,
          montant: parseFloat(String(d.budget_estime || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0,
          date_emission: d.updated_at || d.created_at,
          statut: 'paid'
        }));

      setInvoiceHistory(formattedInvoices);

    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Chargement de vos données...</p>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes totales</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalOrders > 0 
                ? `${stats.completedReports} complétées • ${stats.activeOrders} en cours` 
                : 'Aucune commande'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes actives</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeOrders}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.activeOrders > 0 
                ? 'En cours de traitement' 
                : 'Aucune commande active'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
            <FileText className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.pendingInvoices > 0 
                ? 'À régler' 
                : 'Tout est à jour'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget total</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalAmount > 0 
                ? `${stats.totalAmount.toLocaleString('fr-FR')} DA` 
                : '--'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalDays > 0 
                ? `Sur ${stats.totalDays} jours` 
                : 'Aucun délai défini'}
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