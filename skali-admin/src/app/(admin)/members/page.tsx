'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSupabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Member } from '@/types';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  RefreshCw,
  Loader2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  Weight,
  Ruler,
  Percent,
  ArrowUpDown,
  UserPlus,
} from 'lucide-react';

// Helpers
function calculateAge(birthdate: string | undefined): number | null {
  if (!birthdate) return null;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = (fullName || '').trim().split(' ');
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

// Constants
const ITEMS_PER_PAGE = 12;

type SortField = 'name' | 'age' | 'gender' | 'weight' | 'height' | 'created_at';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'inactive';

export default function MembersPage() {
  // Data states
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Member>>({});

  // Load members
  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process members with computed fields
      const processedMembers: Member[] = (data || []).map((member) => {
        const { firstName, lastName } = parseName(member.name);
        return {
          ...member,
          firstName,
          lastName,
          age: calculateAge(member.birthdate) ?? undefined,
        };
      });

      setMembers(processedMembers);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Erreur lors du chargement des membres');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Filtered & sorted members
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Filter by status
    if (filterStatus === 'active') {
      result = result.filter((m) => m.is_active !== false);
    } else if (filterStatus === 'inactive') {
      result = result.filter((m) => m.is_active === false);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name?.toLowerCase().includes(query) ||
          m.email?.toLowerCase().includes(query) ||
          m.phone?.includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'name':
          valA = a.name?.toLowerCase() || '';
          valB = b.name?.toLowerCase() || '';
          break;
        case 'age':
          valA = a.age || 0;
          valB = b.age || 0;
          break;
        case 'gender':
          valA = a.gender || '';
          valB = b.gender || '';
          break;
        case 'weight':
          valA = a.weight || 0;
          valB = b.weight || 0;
          break;
        case 'height':
          valA = a.height || 0;
          valB = b.height || 0;
          break;
        case 'created_at':
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [members, filterStatus, searchQuery, sortField, sortOrder]);

  // Paginated members
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMembers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMembers, currentPage]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, sortField, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.is_active !== false).length;
    const inactive = total - active;
    const thisMonth = members.filter((m) => {
      const created = new Date(m.created_at);
      const now = new Date();
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;
    return { total, active, inactive, thisMonth };
  }, [members]);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // View member
  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  // Edit member
  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setEditForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      birthdate: member.birthdate,
      gender: member.gender,
      weight: member.weight,
      height: member.height,
      body_fat_percentage: member.body_fat_percentage,
      is_active: member.is_active,
    });
    setIsEditDialogOpen(true);
  };

  // Save member
  const handleSaveMember = async () => {
    if (!selectedMember) return;
    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('members')
        .update({
          name: editForm.name,
          email: editForm.email || null,
          phone: editForm.phone || null,
          birthdate: editForm.birthdate || null,
          gender: editForm.gender || null,
          weight: editForm.weight || null,
          height: editForm.height || null,
          body_fat_percentage: editForm.body_fat_percentage || null,
          is_active: editForm.is_active,
        })
        .eq('id', selectedMember.id);

      if (error) throw error;

      toast.success('Membre mis à jour');
      setIsEditDialogOpen(false);
      loadMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Sortable header component
  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-4 py-3 text-left cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            Membres
          </h1>
          <p className="text-muted-foreground">
            Gestion des adhérents et de leurs informations
          </p>
        </div>
        <Button onClick={loadMembers} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Membres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.active}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              Inactifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{stats.inactive}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{stats.thisMonth}</p>
            <p className="text-xs text-muted-foreground">nouvelles inscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status filter */}
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs uniquement</SelectItem>
                <SelectItem value="inactive">Inactifs uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">Aucun membre trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <SortableHeader field="name" label="Nom" />
                      <SortableHeader field="age" label="Âge" />
                      <SortableHeader field="gender" label="Genre" />
                      <SortableHeader field="weight" label="Poids (kg)" />
                      <SortableHeader field="height" label="Taille (cm)" />
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {member.photo ? (
                                <img
                                  src={member.photo}
                                  alt={member.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{member.name || '--'}</p>
                              {member.email && (
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {member.age !== undefined ? `${member.age} ans` : '--'}
                        </td>
                        <td className="px-4 py-3">
                          {member.gender === 'male' ? 'H' : member.gender === 'female' ? 'F' : '--'}
                        </td>
                        <td className="px-4 py-3">
                          {member.weight ? member.weight.toFixed(1) : '--'}
                        </td>
                        <td className="px-4 py-3">
                          {member.height ? member.height.toFixed(0) : '--'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={member.is_active !== false ? 'default' : 'secondary'}>
                            {member.is_active !== false ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewMember(member)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMember(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} •
                    Page {currentPage} sur {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                {selectedMember?.photo ? (
                  <img
                    src={selectedMember.photo}
                    alt={selectedMember.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <p>{selectedMember?.name || 'Membre'}</p>
                <Badge variant={selectedMember?.is_active !== false ? 'default' : 'secondary'}>
                  {selectedMember?.is_active !== false ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedMember?.email || '--'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{selectedMember?.phone || '--'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date de naissance</p>
                  <p className="font-medium">
                    {formatDate(selectedMember?.birthdate)}
                    {selectedMember?.age !== undefined && ` (${selectedMember.age} ans)`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Genre</p>
                  <p className="font-medium">
                    {selectedMember?.gender === 'male'
                      ? 'Homme'
                      : selectedMember?.gender === 'female'
                      ? 'Femme'
                      : '--'}
                  </p>
                </div>
              </div>
            </div>
            <hr />
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Weight className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Poids</p>
                  <p className="font-medium">
                    {selectedMember?.weight ? `${selectedMember.weight} kg` : '--'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Taille</p>
                  <p className="font-medium">
                    {selectedMember?.height ? `${selectedMember.height} cm` : '--'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Masse grasse</p>
                  <p className="font-medium">
                    {selectedMember?.body_fat_percentage
                      ? `${selectedMember.body_fat_percentage}%`
                      : '--'}
                  </p>
                </div>
              </div>
            </div>
            <hr />
            <div className="text-xs text-muted-foreground">
              Membre depuis le {formatDate(selectedMember?.created_at)}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedMember) handleEditMember(selectedMember);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthdate">Date de naissance</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={editForm.birthdate || ''}
                  onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Genre</Label>
                <Select
                  value={editForm.gender || ''}
                  onValueChange={(v) => setEditForm({ ...editForm, gender: v as 'male' | 'female' | null })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="female">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={editForm.weight || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, weight: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Taille (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={editForm.height || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, height: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyFat">Masse grasse (%)</Label>
                <Input
                  id="bodyFat"
                  type="number"
                  step="0.1"
                  value={editForm.body_fat_percentage || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      body_fat_percentage: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editForm.is_active !== false}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active">Membre actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSaveMember} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
