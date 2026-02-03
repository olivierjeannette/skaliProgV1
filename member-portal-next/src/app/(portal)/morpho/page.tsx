'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemberStore, useUIStore } from '@/store/member-store'
import { analyzeMorphology } from '@/lib/ai/claude'
import * as queries from '@/lib/supabase/queries'
import {
  GlassCard,
  GlassButton,
  LoadingSpinner,
} from '@/components/common'
import { cn, compressImage } from '@/lib/utils'
import type { MorphoPhoto, MorphoAnalysis } from '@/types'
import {
  Camera,
  Image as ImageIcon,
  Upload,
  Trash2,
  Play,
  RefreshCw,
  User,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'

// ============================================
// CONSTANTS
// ============================================

const PHOTO_TYPES: { type: MorphoPhoto['type']; label: string; instruction: string }[] = [
  {
    type: 'front',
    label: 'Face',
    instruction: 'Position debout, bras le long du corps, de face',
  },
  {
    type: 'side',
    label: 'Profil',
    instruction: 'Position debout, bras le long du corps, de profil (côté gauche)',
  },
  {
    type: 'back',
    label: 'Dos',
    instruction: 'Position debout, bras le long du corps, de dos',
  },
]

// ============================================
// PHOTO CAPTURE COMPONENT
// ============================================

interface PhotoCaptureProps {
  photo: MorphoPhoto | null
  type: MorphoPhoto['type']
  label: string
  instruction: string
  onCapture: (dataUrl: string) => void
  onDelete: () => void
  isActive: boolean
  onActivate: () => void
}

function PhotoCapture({
  photo,
  type,
  label,
  instruction,
  onCapture,
  onDelete,
  isActive,
  onActivate,
}: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Start webcam stream
  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (err) {
      setError('Impossible d\'accéder à la caméra')
      console.error('Camera error:', err)
    }
  }

  // Stop webcam stream
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }

  // Capture photo from webcam
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        onCapture(dataUrl)
        stopCamera()
      }
    }
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const dataUrl = await compressImage(file, 2 * 1024 * 1024, 0.8)
        onCapture(dataUrl)
      } catch (err) {
        setError('Erreur lors du chargement de l\'image')
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <GlassCard
      variant={isActive ? 'default' : 'hover'}
      className={cn(
        'relative overflow-hidden transition-all cursor-pointer',
        isActive && 'ring-2 ring-skali-accent'
      )}
      onClick={!isActive ? onActivate : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              photo ? 'bg-green-500/20' : 'bg-gray-700/50'
            )}
          >
            {photo ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Camera className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-white">{label}</h3>
            <p className="text-xs text-gray-400">{instruction}</p>
          </div>
        </div>

        {photo && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>

      {/* Photo/Camera area */}
      <div className="relative aspect-[3/4] bg-gray-800/50 rounded-xl overflow-hidden">
        {photo ? (
          // Show captured photo
          <img
            src={photo.data_url}
            alt={`Photo ${label}`}
            className="w-full h-full object-cover"
          />
        ) : isActive && isStreaming ? (
          // Show webcam stream
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-dashed border-white/30 w-48 h-64 rounded-xl" />
            </div>
          </>
        ) : isActive && error ? (
          // Show error
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : (
          // Show placeholder
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <User className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-xs">Cliquez pour activer</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {isActive && !photo && (
        <div className="mt-3 flex gap-2">
          {isStreaming ? (
            <>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  capturePhoto()
                }}
                className="flex-1"
              >
                <Camera className="w-4 h-4" />
                Capturer
              </GlassButton>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  stopCamera()
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </GlassButton>
            </>
          ) : (
            <>
              <GlassButton
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  startCamera()
                }}
                className="flex-1"
              >
                <Camera className="w-4 h-4" />
                Caméra
              </GlassButton>
              <GlassButton
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="flex-1"
              >
                <Upload className="w-4 h-4" />
                Fichier
              </GlassButton>
            </>
          )}
        </div>
      )}

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Mirror style for selfie camera */}
      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </GlassCard>
  )
}

// ============================================
// ANALYSIS RESULT COMPONENT
// ============================================

interface AnalysisResultProps {
  analysis: MorphoAnalysis
  isExpanded: boolean
  onToggle: () => void
}

function AnalysisResult({ analysis, isExpanded, onToggle }: AnalysisResultProps) {
  return (
    <GlassCard>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-white">
              Analyse du {new Date(analysis.created_at).toLocaleDateString('fr-FR')}
            </h3>
            <p className="text-xs text-gray-400">
              {analysis.photos.length} photo{analysis.photos.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-glass-border">
              {/* Photos preview */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {analysis.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.data_url}
                    alt={`Photo ${photo.type}`}
                    className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
              </div>

              {/* Analysis text */}
              <div className="prose prose-invert prose-sm max-w-none">
                <div
                  className="text-gray-300 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: analysis.ai_analysis
                      .replace(/## /g, '<h3 class="text-lg font-bold text-white mt-4 mb-2">')
                      .replace(/\n- /g, '<br/>• ')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function MorphoPage() {
  const { currentMember } = useMemberStore()
  const { addNotification } = useUIStore()

  const [photos, setPhotos] = useState<(MorphoPhoto | null)[]>([null, null, null])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [previousAnalyses, setPreviousAnalyses] = useState<MorphoAnalysis[]>([])
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Load previous analyses
  useEffect(() => {
    async function loadHistory() {
      if (!currentMember) return
      try {
        const result = await queries.getMorphoAnalyses(currentMember.id)
        if (result.success && result.data) {
          setPreviousAnalyses(result.data)
        }
      } catch (error) {
        console.error('Error loading morpho history:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }
    loadHistory()
  }, [currentMember])

  // Handle photo capture
  const handleCapture = (index: number, dataUrl: string) => {
    const newPhotos = [...photos]
    newPhotos[index] = {
      type: PHOTO_TYPES[index].type,
      data_url: dataUrl,
    }
    setPhotos(newPhotos)

    // Auto-advance to next photo
    if (index < 2) {
      setActiveIndex(index + 1)
    }
  }

  // Handle photo delete
  const handleDelete = (index: number) => {
    const newPhotos = [...photos]
    newPhotos[index] = null
    setPhotos(newPhotos)
  }

  // Reset all photos
  const handleReset = () => {
    setPhotos([null, null, null])
    setActiveIndex(0)
    setAnalysisResult(null)
  }

  // Start analysis
  const handleAnalyze = async () => {
    if (!currentMember) return

    const validPhotos = photos.filter((p): p is MorphoPhoto => p !== null)
    if (validPhotos.length === 0) {
      addNotification({ type: 'error', message: 'Veuillez prendre au moins une photo' })
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const result = await analyzeMorphology(validPhotos, currentMember.name)
      setAnalysisResult(result.content)

      // Save to database
      const saveResult = await queries.createMorphoAnalysis({
        member_id: currentMember.id,
        photos: validPhotos,
        ai_analysis: result.content,
      })

      if (saveResult.success && saveResult.data) {
        setPreviousAnalyses((prev) => [saveResult.data!, ...prev])
        addNotification({ type: 'success', message: 'Analyse terminée et sauvegardée !' })
      }
    } catch (error) {
      console.error('Analysis error:', error)
      addNotification({ type: 'error', message: 'Erreur lors de l\'analyse' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const photosCount = photos.filter((p) => p !== null).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-1">Analyse Morphologique</h1>
        <p className="text-gray-400">
          Prenez 3 photos pour une analyse complète par l'IA
        </p>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard padding="md" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-white mb-1">Comment ça marche ?</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>1. Prenez 3 photos : face, profil et dos</li>
                <li>2. Portez des vêtements ajustés pour une meilleure analyse</li>
                <li>3. Placez-vous devant un fond neutre avec un bon éclairage</li>
                <li>4. L'IA analysera votre posture et morphologie</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Photo Capture Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {PHOTO_TYPES.map((photoType, index) => (
          <PhotoCapture
            key={photoType.type}
            photo={photos[index]}
            type={photoType.type}
            label={photoType.label}
            instruction={photoType.instruction}
            onCapture={(dataUrl) => handleCapture(index, dataUrl)}
            onDelete={() => handleDelete(index)}
            isActive={activeIndex === index}
            onActivate={() => setActiveIndex(index)}
          />
        ))}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <GlassButton
          variant="ghost"
          onClick={handleReset}
          disabled={photosCount === 0 || isAnalyzing}
        >
          <RefreshCw className="w-4 h-4" />
          Recommencer
        </GlassButton>

        <GlassButton
          variant="primary"
          onClick={handleAnalyze}
          disabled={photosCount === 0 || isAnalyzing}
          loading={isAnalyzing}
          className="min-w-[200px]"
        >
          {isAnalyzing ? (
            'Analyse en cours...'
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyser ({photosCount}/3 photos)
            </>
          )}
        </GlassButton>
      </motion.div>

      {/* Current Analysis Result */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Résultat de l'analyse</h2>
                  <p className="text-sm text-gray-400">Analyse effectuée à l'instant</p>
                </div>
              </div>

              <div className="prose prose-invert prose-sm max-w-none">
                <div
                  className="text-gray-300 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: analysisResult
                      .replace(/## /g, '<h3 class="text-lg font-bold text-white mt-4 mb-2">')
                      .replace(/\n- /g, '<br/>• ')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Previous Analyses */}
      {isLoadingHistory ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner message="Chargement de l'historique..." />
        </div>
      ) : previousAnalyses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-skali-accent" />
            Analyses précédentes
          </h2>

          <div className="space-y-3">
            {previousAnalyses.map((analysis) => (
              <AnalysisResult
                key={analysis.id}
                analysis={analysis}
                isExpanded={expandedAnalysis === analysis.id}
                onToggle={() =>
                  setExpandedAnalysis(
                    expandedAnalysis === analysis.id ? null : analysis.id
                  )
                }
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
