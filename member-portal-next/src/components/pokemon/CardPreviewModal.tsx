'use client'

import { useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, usePokemonStore, useMemberStore } from '@/store/member-store'
import { PokemonCard } from './PokemonCard'
import { useNotification } from '@/components/common'
import { X, Download, RefreshCw } from 'lucide-react'

export function CardPreviewModal() {
  const { isCardPreviewOpen, previewCard, closeCardPreview } = useUIStore()
  const { generateCurrentCard } = usePokemonStore()
  const { currentMember, performances } = useMemberStore()
  const { success, error } = useNotification()
  const cardRef = useRef<HTMLDivElement>(null)

  const handleRefresh = useCallback(() => {
    if (currentMember && performances.length > 0) {
      generateCurrentCard(currentMember, performances)
      success('Carte actualisée')
    }
  }, [currentMember, performances, generateCurrentCard, success])

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !previewCard) return

    try {
      // Dynamic import html2canvas
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const link = document.createElement('a')
      link.download = `pokemon-card-${previewCard.member_name.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      success('Carte téléchargée')
    } catch (err) {
      console.error('Error downloading card:', err)
      error('Erreur lors du téléchargement')
    }
  }, [previewCard, success, error])

  return (
    <AnimatePresence>
      {isCardPreviewOpen && previewCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeCardPreview}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={closeCardPreview}
              className="absolute -top-2 -right-2 z-10 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Card */}
            <div ref={cardRef}>
              <PokemonCard card={previewCard} variant="medium" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRefresh}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl transition-colors text-white font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Actualiser
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-skali-green to-skali-accent hover:from-skali-accent hover:to-skali-green rounded-xl transition-all text-white font-medium"
              >
                <Download className="w-5 h-5" />
                Télécharger PNG
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
