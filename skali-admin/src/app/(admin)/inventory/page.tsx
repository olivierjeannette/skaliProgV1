'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { getSupabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Package,
  Settings,
  BookOpen,
  Dumbbell,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  ChevronRight,
  Loader2,
  Save,
  X,
  Boxes,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// Types
interface EquipmentCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  display_order: number;
}

interface Equipment {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
  category_icon?: string;
  quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  weights?: string;
  created_at: string;
}

interface Methodology {
  id: string;
  name: string;
  category: string;
  description: string;
  duration_range?: string;
  intensity?: string;
  use_cases?: string;
}

interface Exercise {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
  equipment_needed?: string;
  description?: string;
  muscles_primary?: string[];
  muscles_secondary?: string[];
}

type ConditionType = 'excellent' | 'good' | 'fair' | 'poor';

const CONDITION_CONFIG: Record<ConditionType, { label: string; color: string }> = {
  excellent: { label: 'Excellent', color: 'bg-green-500' },
  good: { label: 'Bon', color: 'bg-blue-500' },
  fair: { label: 'Correct', color: 'bg-yellow-500' },
  poor: { label: 'À remplacer', color: 'bg-red-500' },
};

export default function InventoryPage() {
  const [currentTab, setCurrentTab] = useState('inventory');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Selection states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Dialog states
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const supabase = getSupabase();

    try {
      // Load categories
      const { data: catData } = await supabase
        .from('equipment_categories')
        .select('*')
        .order('display_order');
      setCategories(catData || []);

      // Load equipment with category info
      const { data: eqData } = await supabase
        .from('equipment_with_category')
        .select('*')
        .order('name');
      setEquipment(eqData || []);

      // Load methodologies
      const { data: methData } = await supabase
        .from('training_methodologies')
        .select('*')
        .order('category');
      setMethodologies(methData || []);

      // Load exercises
      const { data: exData } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      setExercises(exData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter equipment by category and search
  const filteredEquipment = equipment.filter((eq) => {
    if (selectedCategory && eq.category_id !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return eq.name.toLowerCase().includes(query) ||
        eq.category_name?.toLowerCase().includes(query);
    }
    return true;
  });

  // Filter methodologies by search
  const filteredMethodologies = methodologies.filter((m) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query);
    }
    return true;
  });

  // Filter exercises by search
  const filteredExercises = exercises.filter((ex) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return ex.name.toLowerCase().includes(query) ||
        ex.category_name?.toLowerCase().includes(query);
    }
    return true;
  });

  // Stats
  const totalEquipment = equipment.length;
  const totalQuantity = equipment.reduce((sum, eq) => sum + (eq.quantity || 0), 0);
  const poorConditionCount = equipment.filter((eq) => eq.condition === 'poor').length;

  // Save equipment
  const handleSaveEquipment = async (formData: Partial<Equipment>) => {
    setIsSaving(true);
    const supabase = getSupabase();

    try {
      if (editingEquipment) {
        // Update
        const { error } = await supabase
          .from('equipment')
          .update({
            name: formData.name,
            category_id: formData.category_id,
            quantity: formData.quantity,
            condition: formData.condition,
            notes: formData.notes,
            weights: formData.weights,
          })
          .eq('id', editingEquipment.id);

        if (error) throw error;
        toast.success('Équipement modifié');
      } else {
        // Create
        const { error } = await supabase
          .from('equipment')
          .insert({
            name: formData.name,
            category_id: formData.category_id,
            quantity: formData.quantity || 1,
            condition: formData.condition || 'good',
            notes: formData.notes,
            weights: formData.weights,
          });

        if (error) throw error;
        toast.success('Équipement ajouté');
      }

      setEquipmentDialogOpen(false);
      setEditingEquipment(null);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Erreur: ' + message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete equipment
  const handleDeleteEquipment = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;

    const supabase = getSupabase();
    try {
      const { error } = await supabase.from('equipment').delete().eq('id', id);
      if (error) throw error;
      toast.success('Équipement supprimé');
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Erreur: ' + message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-orange-500" />
            Inventaire & Configuration
          </h1>
          <p className="text-muted-foreground">
            Gestion de la salle et méthodologies d&apos;entraînement
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Types d&apos;équipement</p>
                <p className="text-3xl font-bold">{totalEquipment}</p>
              </div>
              <Boxes className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quantité totale</p>
                <p className="text-3xl font-bold">{totalQuantity}</p>
              </div>
              <Package className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Méthodologies</p>
                <p className="text-3xl font-bold">{methodologies.length}</p>
              </div>
              <BookOpen className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={poorConditionCount > 0 ? 'border-red-500/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">À remplacer</p>
                <p className={`text-3xl font-bold ${poorConditionCount > 0 ? 'text-red-500' : ''}`}>
                  {poorConditionCount}
                </p>
              </div>
              <AlertTriangle className={`h-10 w-10 opacity-50 ${poorConditionCount > 0 ? 'text-red-500' : 'text-gray-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config App
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventaire Salle
          </TabsTrigger>
          <TabsTrigger value="methodology" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Méthodologie
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Mouvements
          </TabsTrigger>
        </TabsList>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Générale</CardTitle>
              <CardDescription>
                Paramètres de l&apos;application (voir Settings {'>'} API Keys pour les clés)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cette section permettra de configurer les paramètres généraux de l&apos;application.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Search & Add */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un équipement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingEquipment(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <EquipmentForm
                  equipment={editingEquipment}
                  categories={categories}
                  onSave={handleSaveEquipment}
                  onCancel={() => {
                    setEquipmentDialogOpen(false);
                    setEditingEquipment(null);
                  }}
                  isSaving={isSaving}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-6">
            {/* Categories Sidebar */}
            <Card className="w-64 shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Catégories</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === null
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Boxes className="h-4 w-4" />
                      Tous
                      <Badge variant="secondary" className="ml-auto">
                        {equipment.length}
                      </Badge>
                    </button>
                    {categories.map((cat) => {
                      const count = equipment.filter((e) => e.category_id === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === cat.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span className="truncate">{cat.name}</span>
                          <Badge variant="secondary" className="ml-auto">
                            {count}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Equipment List */}
            <div className="flex-1">
              <ScrollArea className="h-[450px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredEquipment.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="mt-4 font-semibold">Aucun équipement</p>
                    <p className="text-muted-foreground text-sm">
                      {searchQuery ? 'Aucun résultat pour cette recherche' : 'Ajoutez votre premier équipement'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredEquipment.map((eq) => (
                      <Card key={eq.id} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-xl">
                              {eq.category_icon || '📦'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">{eq.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {eq.category_name}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span>Qté: {eq.quantity}</span>
                                {eq.weights && <span>Poids: {eq.weights}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={CONDITION_CONFIG[eq.condition]?.color || 'bg-gray-500'}>
                                {CONDITION_CONFIG[eq.condition]?.label || eq.condition}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingEquipment(eq);
                                  setEquipmentDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEquipment(eq.id, eq.name)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        {/* Methodology Tab */}
        <TabsContent value="methodology" className="space-y-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une méthodologie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMethodologies.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-4 font-semibold">Aucune méthodologie</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredMethodologies.map((m) => (
                  <Card key={m.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{m.name}</CardTitle>
                        <Badge variant="outline">{m.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {m.description}
                      </p>
                      {(m.duration_range || m.intensity) && (
                        <div className="flex gap-2 mt-2">
                          {m.duration_range && (
                            <Badge variant="secondary" className="text-xs">
                              {m.duration_range}
                            </Badge>
                          )}
                          {m.intensity && (
                            <Badge variant="secondary" className="text-xs">
                              {m.intensity}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un mouvement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-12">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-4 font-semibold">Aucun mouvement</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExercises.map((ex) => (
                  <Card key={ex.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{ex.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {ex.category_name || 'Non catégorisé'}
                          </p>
                        </div>
                        {ex.equipment_needed && (
                          <Badge variant="outline">{ex.equipment_needed}</Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Equipment Form Component
function EquipmentForm({
  equipment,
  categories,
  onSave,
  onCancel,
  isSaving,
}: {
  equipment: Equipment | null;
  categories: EquipmentCategory[];
  onSave: (data: Partial<Equipment>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: equipment?.name || '',
    category_id: equipment?.category_id || categories[0]?.id || '',
    quantity: equipment?.quantity || 1,
    condition: equipment?.condition || 'good',
    notes: equipment?.notes || '',
    weights: equipment?.weights || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {equipment ? 'Modifier l\'équipement' : 'Nouvel équipement'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Barbell olympique"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <select
            id="category"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">État</Label>
            <select
              id="condition"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as ConditionType })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Bon</option>
              <option value="fair">Correct</option>
              <option value="poor">À remplacer</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weights">Poids disponibles</Label>
          <Input
            id="weights"
            value={formData.weights}
            onChange={(e) => setFormData({ ...formData, weights: e.target.value })}
            placeholder="Ex: 5-50kg par 2.5kg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes supplémentaires..."
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {equipment ? 'Modifier' : 'Ajouter'}
        </Button>
      </DialogFooter>
    </form>
  );
}
