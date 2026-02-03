'use client'

import { useState } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Home,
  User,
  Trophy,
  History,
  LogOut,
  Dumbbell,
  Zap,
  Shield,
  Wind,
  Heart,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Edit,
  Save,
  X
} from 'lucide-react'

// Composant Carte Pokémon
function PokemonCard() {
  const { linkedMember, pokemonStats } = usePortalStore()

  if (!linkedMember || !pokemonStats) {
    return (
      <div className="text-center py-12 text-slate-400">
        <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>Aucun profil lié</p>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Force': 'from-red-500 to-orange-500',
      'Cardio': 'from-blue-500 to-cyan-500',
      'Hybrid': 'from-purple-500 to-pink-500',
      'Endurance': 'from-green-500 to-emerald-500',
      'Technique': 'from-yellow-500 to-amber-500'
    }
    return colors[type] || 'from-slate-500 to-slate-600'
  }

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      'Commun': 'border-slate-500',
      'Peu Commun': 'border-emerald-500',
      'Rare': 'border-purple-500',
      'Épique': 'border-orange-500',
      'Légendaire': 'border-yellow-500'
    }
    return colors[rarity] || 'border-slate-500'
  }

  const stats = [
    { name: 'ATK', value: pokemonStats.atk, icon: Zap, color: 'text-red-400' },
    { name: 'DEF', value: pokemonStats.def, icon: Shield, color: 'text-blue-400' },
    { name: 'SPD', value: pokemonStats.spd, icon: Wind, color: 'text-cyan-400' },
    { name: 'END', value: pokemonStats.end, icon: Heart, color: 'text-green-400' },
    { name: 'TEC', value: pokemonStats.tec, icon: Target, color: 'text-yellow-400' }
  ]

  return (
    <div className={`relative w-full max-w-sm mx-auto rounded-2xl bg-gradient-to-br ${getTypeColor(pokemonStats.type)} p-1 shadow-2xl`}>
      <div className={`bg-slate-900 rounded-xl p-4 border-4 ${getRarityColor(pokemonStats.rarity)}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{linkedMember.firstName || linkedMember.name}</h3>
            <Badge variant="outline" className="mt-1 border-slate-500 text-slate-300">
              {pokemonStats.type}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">Nv.{pokemonStats.level}</div>
            <div className="text-xs text-slate-400">{pokemonStats.rarity}</div>
          </div>
        </div>

        {/* Avatar area */}
        <div className={`aspect-square rounded-lg bg-gradient-to-br ${getTypeColor(pokemonStats.type)} p-4 mb-4 flex items-center justify-center`}>
          <div className="w-32 h-32 rounded-full bg-slate-800/50 flex items-center justify-center backdrop-blur-sm">
            <User className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>XP</span>
            <span>{pokemonStats.xp}/1000</span>
          </div>
          <Progress value={(pokemonStats.xp / 1000) * 100} className="h-2 bg-slate-700" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2">
          {stats.map((stat) => (
            <div key={stat.name} className="text-center">
              <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
              <div className="text-xs text-slate-400">{stat.name}</div>
              <div className="text-sm font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Onglet Infos personnelles
function PersonalInfoTab() {
  const { linkedMember } = usePortalStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    weight: linkedMember?.weight?.toString() || '',
    height: linkedMember?.height?.toString() || '',
    phone: linkedMember?.phone || '',
    email: linkedMember?.email || ''
  })

  if (!linkedMember) {
    return <div className="text-center py-8 text-slate-400">Profil non lié</div>
  }

  const handleSave = () => {
    // TODO: Sauvegarder dans Supabase
    setIsEditing(false)
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(linkedMember.birthDate)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Informations personnelles</h3>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-1" />
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Sauvegarder
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <Label className="text-slate-400 text-xs">Nom complet</Label>
            <p className="text-white font-medium">{linkedMember.name}</p>
          </CardContent>
        </Card>

        {linkedMember.gender && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <Label className="text-slate-400 text-xs">Genre</Label>
              <p className="text-white font-medium">
                {linkedMember.gender === 'M' ? '♂ Homme' : '♀ Femme'}
              </p>
            </CardContent>
          </Card>
        )}

        {age && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <Label className="text-slate-400 text-xs">Âge</Label>
              <p className="text-white font-medium">{age} ans</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <Label className="text-slate-400 text-xs">Poids (kg)</Label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="mt-1 bg-slate-900/50 border-slate-600"
              />
            ) : (
              <p className="text-white font-medium">{linkedMember.weight || '-'} kg</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <Label className="text-slate-400 text-xs">Taille (cm)</Label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="mt-1 bg-slate-900/50 border-slate-600"
              />
            ) : (
              <p className="text-white font-medium">{linkedMember.height || '-'} cm</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <Label className="text-slate-400 text-xs">Téléphone</Label>
            {isEditing ? (
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 bg-slate-900/50 border-slate-600"
              />
            ) : (
              <p className="text-white font-medium">{linkedMember.phone || '-'}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <Label className="text-slate-400 text-xs">Email</Label>
            {isEditing ? (
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 bg-slate-900/50 border-slate-600"
              />
            ) : (
              <p className="text-white font-medium truncate">{linkedMember.email || '-'}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Onglet Performances
function PerformancesTab() {
  const { linkedMember, pokemonStats } = usePortalStore()

  // Performances mock
  const performances = [
    { exercise: 'Back Squat', value: '120 kg', pr: true, date: '2024-01-15' },
    { exercise: 'Deadlift', value: '150 kg', pr: true, date: '2024-01-10' },
    { exercise: 'Bench Press', value: '85 kg', pr: false, date: '2024-01-08' },
    { exercise: 'Clean & Jerk', value: '80 kg', pr: true, date: '2024-01-05' },
    { exercise: 'Snatch', value: '65 kg', pr: false, date: '2024-01-03' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Mes Performances</h3>
        <Button size="sm">
          <TrendingUp className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Stats summary */}
      {pokemonStats && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30">
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
              <div className="text-2xl font-bold text-white">{pokemonStats.level}</div>
              <div className="text-xs text-emerald-300">Niveau</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-xs text-purple-300">Nouveaux PRs</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PRs list */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300">Records Personnels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {performances.map((perf, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50"
            >
              <div className="flex items-center gap-3">
                <Dumbbell className="h-5 w-5 text-slate-400" />
                <div>
                  <div className="font-medium text-white">{perf.exercise}</div>
                  <div className="text-xs text-slate-400">{perf.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{perf.value}</span>
                {perf.pr && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    PR
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Onglet Historique
function HistoryTab() {
  // Sessions mock
  const sessions = [
    { date: '2024-01-20', type: 'CrossTraining', name: 'WOD Murph', duration: '45 min' },
    { date: '2024-01-18', type: 'Musculation', name: 'Upper Body', duration: '60 min' },
    { date: '2024-01-16', type: 'Cardio', name: 'Running 5K', duration: '25 min' },
    { date: '2024-01-14', type: 'Hyrox', name: 'Simulation', duration: '75 min' },
    { date: '2024-01-12', type: 'CrossTraining', name: 'AMRAP 20', duration: '20 min' }
  ]

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'CrossTraining': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Musculation': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Cardio': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Hyrox': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Récupération': 'bg-green-500/20 text-green-400 border-green-500/30'
    }
    return colors[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Historique</h3>
        <Badge variant="outline" className="border-slate-600 text-slate-300">
          {sessions.length} sessions
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-1 text-slate-400" />
            <div className="text-xl font-bold text-white">12</div>
            <div className="text-xs text-slate-400">Ce mois</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-1 text-emerald-400" />
            <div className="text-xl font-bold text-white">+3</div>
            <div className="text-xs text-slate-400">vs dernier mois</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <Dumbbell className="h-6 w-6 mx-auto mb-1 text-blue-400" />
            <div className="text-xl font-bold text-white">48</div>
            <div className="text-xs text-slate-400">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions list */}
      <div className="space-y-2">
        {sessions.map((session, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-center min-w-[50px]">
                  <div className="text-xs text-slate-400">
                    {new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-white">{session.name}</div>
                  <Badge className={`text-xs ${getTypeColor(session.type)}`}>
                    {session.type}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-slate-400">{session.duration}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Page principale
export default function PortalPage() {
  const { linkedMember, logout } = usePortalStore()
  const [activeTab, setActiveTab] = useState('home')

  // Si pas de membre lié, on ne devrait pas arriver ici
  // mais on gère le cas au cas où
  if (!linkedMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-slate-800/80 border-slate-700 p-6">
          <div className="text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-slate-500" />
            <h2 className="text-xl font-bold text-white mb-2">Profil non lié</h2>
            <p className="text-slate-400 mb-4">Veuillez lier votre profil à votre Discord</p>
            <Button onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-white">Skàli Portal</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto p-4">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1">
                Bienvenue, {linkedMember.firstName || linkedMember.name} !
              </h1>
              <p className="text-slate-400 text-sm">Voici votre carte Pokémon</p>
            </div>
            <PokemonCard />
          </div>
        )}

        {activeTab === 'data' && (
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="personal">
                <User className="h-4 w-4 mr-1" />
                Infos
              </TabsTrigger>
              <TabsTrigger value="performances">
                <Trophy className="h-4 w-4 mr-1" />
                Perfs
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-1" />
                Historique
              </TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="mt-4">
              <PersonalInfoTab />
            </TabsContent>
            <TabsContent value="performances" className="mt-4">
              <PerformancesTab />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <HistoryTab />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 px-4 py-2 safe-area-pb">
        <div className="max-w-lg mx-auto flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              activeTab === 'home'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Accueil</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              activeTab === 'data'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs font-medium">Mes Données</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
