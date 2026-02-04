'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Target,
  RefreshCw,
  UserPlus,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Ban,
  List,
  Home,
  Eye,
  Edit,
  MessageSquare,
  Mail,
  Clock,
  TrendingUp,
  Users,
  Dumbbell,
  Sparkles,
  Building,
} from 'lucide-react';
import {
  type Lead,
  type LeadStatus,
  type LeadService,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
} from '@/types';
import { createClient } from '@/lib/supabase/client';

// Tab configuration
const TABS = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'prospect', label: 'Prospects', icon: UserPlus },
  { id: 'contacte_attente', label: 'Contactés', icon: Phone },
  { id: 'rdv_essai', label: 'RDV Essai', icon: Calendar },
  { id: 'converti', label: 'Convertis', icon: CheckCircle },
  { id: 'non_converti_prix', label: 'Non convertis', icon: XCircle },
  { id: 'liste_rouge', label: 'Liste rouge', icon: Ban },
  { id: 'all', label: 'Tous', icon: List },
];

// Service icons
const SERVICE_ICONS: Record<string, typeof Dumbbell> = {
  fitness: Dumbbell,
  pilates: Sparkles,
  coaching: Users,
  teambuilding: Building,
};

// Default icon for unknown services
const DEFAULT_SERVICE_ICON = Dumbbell;

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<LeadStatus>('prospect');

  // Load leads from Supabase
  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading leads:', error);
      } else {
        setLeads(data as Lead[] || []);
      }
    } catch (err) {
      console.error('Error loading leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Calculate stats
  const stats = {
    total: leads.length,
    prospect: leads.filter(l => l.status === 'prospect').length,
    contacte: leads.filter(l => l.status === 'contacte_attente').length,
    rdv: leads.filter(l => l.status === 'rdv_essai').length,
    converti: leads.filter(l => l.status === 'converti_abonnement' || l.status === 'converti_carnets').length,
    nonConverti: leads.filter(l => l.status === 'non_converti_prix').length,
    listeRouge: leads.filter(l => l.status === 'liste_rouge').length,
  };

  // Filter leads by tab
  const getFilteredLeads = () => {
    switch (activeTab) {
      case 'home':
      case 'all':
        return leads;
      case 'prospect':
        return leads.filter(l => l.status === 'prospect');
      case 'contacte_attente':
        return leads.filter(l => l.status === 'contacte_attente');
      case 'rdv_essai':
        return leads.filter(l => l.status === 'rdv_essai');
      case 'converti':
        return leads.filter(l => l.status === 'converti_abonnement' || l.status === 'converti_carnets');
      case 'non_converti_prix':
        return leads.filter(l => l.status === 'non_converti_prix');
      case 'liste_rouge':
        return leads.filter(l => l.status === 'liste_rouge');
      default:
        return leads;
    }
  };

  // Open detail dialog
  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  // Open edit dialog
  const openEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || '');
    setEditStatus(lead.status);
    setIsEditOpen(true);
  };

  // Save lead changes
  const saveLeadChanges = async () => {
    if (!selectedLead) return;

    const updatedLead: Lead = {
      ...selectedLead,
      status: editStatus,
      notes: editNotes,
      updated_at: new Date().toISOString(),
      ...(editStatus !== selectedLead.status && editStatus.startsWith('converti')
        ? { converted_at: new Date().toISOString() }
        : {}),
      ...(editStatus !== selectedLead.status && editStatus === 'contacte_attente'
        ? { contacted_at: new Date().toISOString() }
        : {}),
    };

    // Update locally
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));

    // Try to update in Supabase
    try {
      const supabase = createClient();
      await supabase
        .from('leads')
        .update({
          status: editStatus,
          notes: editNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedLead.id);
    } catch (err) {
      console.error('Error updating lead:', err);
    }

    setIsEditOpen(false);
    setSelectedLead(null);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Days ago
  const daysAgo = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (24 * 60 * 60 * 1000));
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    return `Il y a ${days} jours`;
  };

  const filteredLeads = getFilteredLeads();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            CRM - Gestion des Leads
          </h1>
          <p className="text-muted-foreground mt-1">
            Centralisation des formulaires de contact des sites La Skàli
          </p>
        </div>
        <Button onClick={loadLeads} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.prospect}</div>
            <div className="text-xs text-muted-foreground">Prospects</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.contacte}</div>
            <div className="text-xs text-muted-foreground">Contactés</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.rdv}</div>
            <div className="text-xs text-muted-foreground">RDV Essai</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.converti}</div>
            <div className="text-xs text-muted-foreground">Convertis</div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.nonConverti}</div>
            <div className="text-xs text-muted-foreground">Non convertis</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-500/10 border-gray-500/30">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-gray-500">{stats.listeRouge}</div>
            <div className="text-xs text-muted-foreground">Liste rouge</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const count = tab.id === 'home' || tab.id === 'all' ? stats.total :
              tab.id === 'converti' ? stats.converti :
              tab.id === 'prospect' ? stats.prospect :
              tab.id === 'contacte_attente' ? stats.contacte :
              tab.id === 'rdv_essai' ? stats.rdv :
              tab.id === 'non_converti_prix' ? stats.nonConverti :
              tab.id === 'liste_rouge' ? stats.listeRouge : 0;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <Badge variant="secondary" className="ml-1">{count}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun lead dans cette catégorie</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map(lead => {
                      const ServiceIcon = SERVICE_ICONS[lead.service] || DEFAULT_SERVICE_ICON;
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <ServiceIcon className="h-3 w-3" />
                              {lead.service}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                              {lead.email && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </span>
                              )}
                              {lead.phone && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {lead.phone}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              style={{
                                backgroundColor: `${LEAD_STATUS_COLORS[lead.status]}20`,
                                borderColor: `${LEAD_STATUS_COLORS[lead.status]}50`,
                                color: LEAD_STATUS_COLORS[lead.status],
                              }}
                            >
                              {LEAD_STATUS_LABELS[lead.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span>{formatDate(lead.created_at)}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {daysAgo(lead.created_at)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openDetail(lead)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(lead)}>
                                <Edit className="h-4 w-4" />
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

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Détails du lead
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nom</label>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Service</label>
                  <p className="font-medium capitalize">{selectedLead.service}</p>
                </div>
                {selectedLead.email && (
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                )}
                {selectedLead.phone && (
                  <div>
                    <label className="text-sm text-muted-foreground">Téléphone</label>
                    <p className="font-medium">{selectedLead.phone}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Statut</label>
                <Badge
                  className="mt-1"
                  style={{
                    backgroundColor: `${LEAD_STATUS_COLORS[selectedLead.status]}20`,
                    borderColor: `${LEAD_STATUS_COLORS[selectedLead.status]}50`,
                    color: LEAD_STATUS_COLORS[selectedLead.status],
                  }}
                >
                  {LEAD_STATUS_LABELS[selectedLead.status]}
                </Badge>
              </div>
              {selectedLead.message && (
                <div>
                  <label className="text-sm text-muted-foreground">Message</label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedLead.message}</p>
                </div>
              )}
              {selectedLead.notes && (
                <div>
                  <label className="text-sm text-muted-foreground">Notes</label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedLead.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground">Créé le</label>
                  <p>{formatDate(selectedLead.created_at)}</p>
                </div>
                {selectedLead.contacted_at && (
                  <div>
                    <label className="text-muted-foreground">Contacté le</label>
                    <p>{formatDate(selectedLead.contacted_at)}</p>
                  </div>
                )}
                {selectedLead.converted_at && (
                  <div>
                    <label className="text-muted-foreground">Converti le</label>
                    <p>{formatDate(selectedLead.converted_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => { setIsDetailOpen(false); openEdit(selectedLead!); }}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Modifier le lead
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <p className="text-muted-foreground">{selectedLead.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as LeadStatus)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map(status => (
                      <SelectItem key={status} value={status}>
                        {LEAD_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  className="mt-1"
                  placeholder="Ajouter des notes..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveLeadChanges}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
