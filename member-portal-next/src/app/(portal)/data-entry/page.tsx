'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMemberStore, useUIStore } from '@/store/member-store'
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassSelect,
  LoadingSpinner,
} from '@/components/common'
import {
  User,
  Scale,
  Ruler,
  Percent,
  Calendar,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Heart,
  Activity,
} from 'lucide-react'

interface FormData {
  name: string
  email: string
  phone: string
  weight: string
  height: string
  body_fat_percentage: string
  gender: 'male' | 'female' | ''
  birth_date: string
}

interface FormErrors {
  name?: string
  email?: string
  weight?: string
  height?: string
  body_fat_percentage?: string
  birth_date?: string
}

// Gender options for select
const GENDER_OPTIONS = [
  { value: '', label: 'Sélectionner...' },
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
]

// Calculate age from birth date
function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Calculate BMI
function calculateBMI(weight: number, height: number): number | null {
  if (!weight || !height) return null
  const heightInMeters = height / 100
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
}

// Get BMI category
function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Insuffisance pondérale', color: 'text-blue-400' }
  if (bmi < 25) return { label: 'Poids normal', color: 'text-green-400' }
  if (bmi < 30) return { label: 'Surpoids', color: 'text-yellow-400' }
  return { label: 'Obésité', color: 'text-red-400' }
}

export default function DataEntryPage() {
  const { currentMember, updateMember, isLoadingMember, error } = useMemberStore()
  const { addNotification } = useUIStore()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    weight: '',
    height: '',
    body_fat_percentage: '',
    gender: '',
    birth_date: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form with current member data
  useEffect(() => {
    if (currentMember) {
      setFormData({
        name: currentMember.name || '',
        email: currentMember.email || '',
        phone: currentMember.phone || '',
        weight: currentMember.weight?.toString() || '',
        height: currentMember.height?.toString() || '',
        body_fat_percentage: currentMember.body_fat_percentage?.toString() || '',
        gender: currentMember.gender || '',
        birth_date: currentMember.birth_date || '',
      })
    }
  }, [currentMember])

  // Track changes
  useEffect(() => {
    if (currentMember) {
      const hasModifications =
        formData.name !== (currentMember.name || '') ||
        formData.email !== (currentMember.email || '') ||
        formData.phone !== (currentMember.phone || '') ||
        formData.weight !== (currentMember.weight?.toString() || '') ||
        formData.height !== (currentMember.height?.toString() || '') ||
        formData.body_fat_percentage !== (currentMember.body_fat_percentage?.toString() || '') ||
        formData.gender !== (currentMember.gender || '') ||
        formData.birth_date !== (currentMember.birth_date || '')
      setHasChanges(hasModifications)
    }
  }, [formData, currentMember])

  // Handle input changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    // Weight validation
    if (formData.weight) {
      const weight = parseFloat(formData.weight)
      if (isNaN(weight) || weight < 30 || weight > 300) {
        newErrors.weight = 'Poids invalide (30-300 kg)'
      }
    }

    // Height validation
    if (formData.height) {
      const height = parseFloat(formData.height)
      if (isNaN(height) || height < 100 || height > 250) {
        newErrors.height = 'Taille invalide (100-250 cm)'
      }
    }

    // Body fat validation
    if (formData.body_fat_percentage) {
      const bodyFat = parseFloat(formData.body_fat_percentage)
      if (isNaN(bodyFat) || bodyFat < 3 || bodyFat > 60) {
        newErrors.body_fat_percentage = '% masse grasse invalide (3-60%)'
      }
    }

    // Birth date validation
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date)
      const today = new Date()
      const age = calculateAge(formData.birth_date)
      if (birthDate > today) {
        newErrors.birth_date = 'Date de naissance dans le futur'
      } else if (age !== null && (age < 10 || age > 100)) {
        newErrors.birth_date = 'Âge invalide (10-100 ans)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      addNotification({
        type: 'error',
        message: 'Veuillez corriger les erreurs dans le formulaire',
      })
      return
    }

    if (!currentMember) {
      addNotification({
        type: 'error',
        message: 'Profil non trouvé',
      })
      return
    }

    setIsSaving(true)

    try {
      await updateMember(currentMember.id, {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        body_fat_percentage: formData.body_fat_percentage
          ? parseFloat(formData.body_fat_percentage)
          : undefined,
        gender: formData.gender || undefined,
        birth_date: formData.birth_date || undefined,
      })

      addNotification({
        type: 'success',
        message: 'Données enregistrées avec succès !',
      })
      setHasChanges(false)
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de la sauvegarde',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset form to original values
  const handleReset = () => {
    if (currentMember) {
      setFormData({
        name: currentMember.name || '',
        email: currentMember.email || '',
        phone: currentMember.phone || '',
        weight: currentMember.weight?.toString() || '',
        height: currentMember.height?.toString() || '',
        body_fat_percentage: currentMember.body_fat_percentage?.toString() || '',
        gender: currentMember.gender || '',
        birth_date: currentMember.birth_date || '',
      })
      setErrors({})
    }
  }

  // Calculated values
  const age = calculateAge(formData.birth_date)
  const bmi =
    formData.weight && formData.height
      ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))
      : null
  const bmiCategory = bmi ? getBMICategory(bmi) : null

  if (isLoadingMember || !currentMember) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Chargement des données..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Mes Données Personnelles
        </h1>
        <p className="text-gray-400">
          Mettez à jour vos informations pour un suivi personnalisé
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-skali-green/20 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-skali-green" />
              </div>
              <h2 className="text-xl font-bold text-white">Identité</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassInput
                label="Nom complet *"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Votre nom"
                error={errors.name}
                icon={<User className="w-4 h-4" />}
              />

              <GlassInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="votre@email.com"
                error={errors.email}
              />

              <GlassInput
                label="Téléphone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="06 12 34 56 78"
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                  className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-skali-accent/50 focus:border-skali-accent transition-all duration-200"
                />
                {errors.birth_date && (
                  <p className="text-sm text-red-400">{errors.birth_date}</p>
                )}
                {age !== null && (
                  <p className="text-sm text-gray-400">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {age} ans
                  </p>
                )}
              </div>

              <GlassSelect
                label="Genre"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value as any)}
                options={GENDER_OPTIONS}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Physical Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Données Physiques</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassInput
                label="Poids (kg)"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="75.0"
                error={errors.weight}
                icon={<Scale className="w-4 h-4" />}
              />

              <GlassInput
                label="Taille (cm)"
                type="number"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                placeholder="180"
                error={errors.height}
                icon={<Ruler className="w-4 h-4" />}
              />

              <GlassInput
                label="% Masse grasse"
                type="number"
                step="0.1"
                value={formData.body_fat_percentage}
                onChange={(e) => handleChange('body_fat_percentage', e.target.value)}
                placeholder="15.0"
                error={errors.body_fat_percentage}
                icon={<Percent className="w-4 h-4" />}
              />
            </div>

            {/* Calculated metrics */}
            {(bmi || formData.body_fat_percentage) && (
              <div className="mt-6 pt-6 border-t border-glass-border">
                <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Indicateurs Calculés
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bmi && bmiCategory && (
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">IMC</p>
                      <p className="text-2xl font-bold text-white">{bmi}</p>
                      <p className={`text-sm ${bmiCategory.color}`}>
                        {bmiCategory.label}
                      </p>
                    </div>
                  )}

                  {formData.body_fat_percentage && formData.weight && (
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Masse maigre estimée</p>
                      <p className="text-2xl font-bold text-white">
                        {Math.round(
                          parseFloat(formData.weight) *
                            (1 - parseFloat(formData.body_fat_percentage) / 100) *
                            10
                        ) / 10}{' '}
                        kg
                      </p>
                      <p className="text-sm text-gray-400">
                        {Math.round(100 - parseFloat(formData.body_fat_percentage))}% du poids
                      </p>
                    </div>
                  )}

                  {formData.body_fat_percentage && formData.weight && (
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Masse grasse</p>
                      <p className="text-2xl font-bold text-white">
                        {Math.round(
                          parseFloat(formData.weight) *
                            (parseFloat(formData.body_fat_percentage) / 100) *
                            10
                        ) / 10}{' '}
                        kg
                      </p>
                      <p className="text-sm text-gray-400">
                        {formData.body_fat_percentage}% du poids
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-end"
        >
          <GlassButton
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
            className="sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </GlassButton>

          <GlassButton
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={!hasChanges || isSaving}
            className="sm:w-auto"
          >
            {isSaving ? (
              'Enregistrement...'
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </>
            )}
          </GlassButton>
        </motion.div>

        {/* Save status indicator */}
        {hasChanges && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-amber-400"
          >
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Vous avez des modifications non enregistrées
          </motion.p>
        )}

        {!hasChanges && currentMember && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-green-400"
          >
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Toutes les données sont à jour
          </motion.p>
        )}
      </form>
    </div>
  )
}
