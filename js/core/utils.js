// Fonctions utilitaires
const Utils = {
    // Formater une date en clé (YYYY-MM-DD)
    formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    // Fermer une modal
    closeModal(event) {
        if (!event || event.target === event.currentTarget) {
            const modalContainer = document.getElementById('modalContainer');

            // Réinitialiser le flag drag & drop avant de vider le contenu
            const blocksList = modalContainer?.querySelector('#blocksList');
            if (blocksList) {
                blocksList._dragInitialized = false;
            }

            modalContainer.innerHTML = '';
        }
    },

    // Afficher une notification
    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            info: 'bg-blue-600',
            warning: 'bg-yellow-600'
        };

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3 fade-in`;
        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove après 5 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },

    // Télécharger un fichier JSON
    downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Télécharger un fichier CSV
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Convertir le temps en secondes
    parseTimeToSeconds(timeStr) {
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1]; // mm:ss
        } else if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hh:mm:ss
        }
        return 0;
    },

    // Formater une valeur de performance
    formatPerformanceValue(performance) {
        switch (performance.type) {
            case 'weight':
                return `${performance.value} kg`;
            case 'time':
                return performance.value;
            case 'distance':
                return `${performance.value} m`;
            case 'reps':
                return `${performance.value} reps`;
            default:
                return performance.value;
        }
    },

    // Calculer l'évolution entre deux performances
    calculateEvolution(current, previous) {
        if (!previous) {
            return null;
        }

        // Pour les performances basées sur le temps (plus bas = mieux)
        if (current.type === 'time') {
            const currentTime = this.parseTimeToSeconds(current.value);
            const previousTime = this.parseTimeToSeconds(previous.value);
            const diff = previousTime - currentTime;
            const percentage = ((diff / previousTime) * 100).toFixed(1);

            if (diff > 0) {
                return {
                    value: diff,
                    icon: 'arrow-up',
                    color: 'performance-trend-up',
                    text: `-${Math.abs(percentage)}%`
                };
            } else if (diff < 0) {
                return {
                    value: diff,
                    icon: 'arrow-down',
                    color: 'performance-trend-down',
                    text: `+${Math.abs(percentage)}%`
                };
            } else {
                return {
                    value: 0,
                    icon: 'minus',
                    color: 'performance-trend-stable',
                    text: '0%'
                };
            }
        }

        // Pour le poids, distance, reps (plus haut = mieux)
        const currentVal = parseFloat(current.value);
        const previousVal = parseFloat(previous.value);
        const diff = currentVal - previousVal;
        const percentage = ((diff / previousVal) * 100).toFixed(1);

        if (diff > 0) {
            return {
                value: diff,
                icon: 'arrow-up',
                color: 'performance-trend-up',
                text: `+${percentage}%`
            };
        } else if (diff < 0) {
            return {
                value: diff,
                icon: 'arrow-down',
                color: 'performance-trend-down',
                text: `${percentage}%`
            };
        } else {
            return {
                value: 0,
                icon: 'minus',
                color: 'performance-trend-stable',
                text: '0%'
            };
        }
    },

    // Calculer la tendance
    calculateTrend(latest, previous) {
        if (!previous) {
            return { icon: 'minus', color: 'performance-trend-stable', text: 'Première mesure' };
        }

        const evolution = this.calculateEvolution(latest, previous);
        if (evolution.value > 0) {
            return { icon: 'arrow-up', color: 'performance-trend-up', text: 'En progression' };
        } else if (evolution.value < 0) {
            return { icon: 'arrow-down', color: 'performance-trend-down', text: 'En baisse' };
        } else {
            return { icon: 'minus', color: 'performance-trend-stable', text: 'Stable' };
        }
    },

    // Obtenir la date de dernière performance d'un membre
    getLastPerformanceDate(member) {
        if (!member.performances) {
            return 'Jamais';
        }

        let latestDate = null;
        Object.values(member.performances).forEach(exercisePerfs => {
            exercisePerfs.forEach(perf => {
                const perfDate = new Date(perf.date);
                if (!latestDate || perfDate > latestDate) {
                    latestDate = perfDate;
                }
            });
        });

        return latestDate ? latestDate.toLocaleDateString('fr-FR') : 'Jamais';
    },

    // Ouvrir une modale générique (auto-size + draggable)
    openModal(options) {
        const {
            title = '',
            subtitle = '',
            content = '',
            size = 'large', // large | xl | auto
            draggable = true
        } = options || {};

        const container = document.getElementById('modalContainer');
        if (!container) {
            return;
        }

        const sizeClass = size === 'xl' ? 'modal-xl' : size === 'large' ? 'modal-large' : '';

        container.innerHTML = `
			<div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
				<div class="modal-content ${sizeClass}" role="dialog" aria-modal="true" onclick="event.stopPropagation()">
					<div class="modal-header">
						<div class="modal-header-content">
							<div class="modal-avatar">
								<i class="fas fa-user"></i>
							</div>
							<div class="modal-title-section">
								<h3 class="modal-title">${title}</h3>
								${subtitle ? `<p class="modal-subtitle">${subtitle}</p>` : ''}
							</div>
						</div>
						<button onclick="Utils.closeModal()" class="modal-close" aria-label="Fermer">
							<i class="fas fa-times"></i>
						</button>
					</div>
					<div class="modal-body">${content}</div>
				</div>
			</div>
		`;

        const modalEl = container.querySelector('.modal-content');
        this.autoSizeModal(modalEl);
        if (draggable) {
            this.enableModalDrag(modalEl, '.modal-header');
        }

        // Afficher avec animation
        requestAnimationFrame(() => {
            modalEl.classList.add('modal-show');
        });

        // Recalcule à chaque resize
        const onResize = () => this.autoSizeModal(modalEl);
        window.addEventListener('resize', onResize);
        // Nettoyage quand on ferme
        const observer = new MutationObserver(() => {
            if (!container.firstChild) {
                window.removeEventListener('resize', onResize);
                observer.disconnect();
            }
        });
        observer.observe(container, { childList: true });
    },

    // Ajuster taille/position pour éviter le scroll intempestif
    autoSizeModal(modalEl) {
        if (!modalEl) {
            return;
        }
        const margin = 24; // marge autour
        const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        const maxWidth = Math.min(980, vw - margin * 2);
        const maxHeight = Math.min(0.9 * vh, vh - margin * 2);

        modalEl.style.maxWidth = `${maxWidth}px`;
        modalEl.style.maxHeight = `${maxHeight}px`;
        modalEl.style.width = '100%';
        modalEl.style.height = 'auto';

        // corps scrollable uniquement si nécessaire
        const body = modalEl.querySelector('.modal-body');
        if (body) {
            const header = modalEl.querySelector('.modal-header');
            const actions = modalEl.querySelector('.modal-actions');
            const headerH = header ? header.offsetHeight : 0;
            const actionsH = actions ? actions.offsetHeight : 0;
            const padding = 32; // somme des paddings
            body.style.maxHeight = `${maxHeight - headerH - actionsH - padding}px`;
            body.style.overflow = 'auto';
        }
    },

    // Rendre la modale déplaçable via le header
    enableModalDrag(modalEl, handleSelector = '.modal-header') {
        if (!modalEl) {
            return;
        }
        const handle = modalEl.querySelector(handleSelector) || modalEl;
        let isDragging = false;
        let startX = 0,
            startY = 0;
        let startLeft = 0,
            startTop = 0;

        handle.style.cursor = 'move';
        modalEl.style.position = 'relative';

        const onMouseDown = e => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = modalEl.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = e => {
            if (!isDragging) {
                return;
            }
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            modalEl.style.transform = `translate(${dx}px, ${dy}px)`;
        };

        const onMouseUp = () => {
            if (!isDragging) {
                return;
            }
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        handle.addEventListener('mousedown', onMouseDown);
    }
};
// Exposer globalement
window.Utils = Utils;

console.log('✅ Module Utils chargé');
