/**
 * ═══════════════════════════════════════════════════════════════
 * PORTAIL ADHÉRENT - MOBILE HAMBURGER MENU
 * Menu latéral slide-in pour smartphone avec animations natives
 * ═══════════════════════════════════════════════════════════════
 */

console.log('🍔 Chargement portal-mobile-menu.js');

/**
 * Toggle mobile menu (hamburger)
 * Optimisé pour une expérience tactile fluide
 */
window.toggleMobileMenu = function () {
    const menu = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('menuBackdrop');
    const sidebar = document.getElementById('menuSidebar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');

    if (!menu || !backdrop || !sidebar) {
        console.error('❌ Menu elements not found');
        return;
    }

    const isOpen = sidebar.classList.contains('translate-x-0');

    if (isOpen) {
        // Fermer le menu avec animation
        closeMobileMenu(sidebar, backdrop, menu, hamburgerBtn);
    } else {
        // Ouvrir le menu avec animation
        openMobileMenu(sidebar, backdrop, menu, hamburgerBtn);
    }
};

/**
 * Ouvrir le menu mobile avec feedback tactile
 * @param sidebar
 * @param backdrop
 * @param menu
 * @param hamburgerBtn
 */
function openMobileMenu(sidebar, backdrop, menu, hamburgerBtn) {
    // Vibration légère si supportée
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }

    // Débloquer les interactions
    menu.classList.remove('pointer-events-none');

    // Afficher le backdrop
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');

    // Slide-in du sidebar avec léger délai pour le backdrop
    setTimeout(() => {
        sidebar.classList.remove('translate-x-full');
        sidebar.classList.add('translate-x-0');
    }, 50);

    // Changer l'icône en X avec rotation
    if (hamburgerBtn) {
        hamburgerBtn.style.transform = 'rotate(90deg)';
        setTimeout(() => {
            hamburgerBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
            hamburgerBtn.style.transform = '';
        }, 150);
    }

    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
}

/**
 * Fermer le menu mobile avec feedback tactile
 * @param sidebar
 * @param backdrop
 * @param menu
 * @param hamburgerBtn
 */
function closeMobileMenu(sidebar, backdrop, menu, hamburgerBtn) {
    // Vibration légère si supportée
    if ('vibrate' in navigator) {
        navigator.vibrate(5);
    }

    // Slide-out du sidebar
    sidebar.classList.remove('translate-x-0');
    sidebar.classList.add('translate-x-full');

    // Masquer le backdrop après un léger délai
    setTimeout(() => {
        backdrop.classList.remove('opacity-100', 'pointer-events-auto');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
        menu.classList.add('pointer-events-none');
    }, 150);

    // Changer l'icône en hamburger avec rotation
    if (hamburgerBtn) {
        hamburgerBtn.style.transform = 'rotate(-90deg)';
        setTimeout(() => {
            hamburgerBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
            hamburgerBtn.style.transform = '';
        }, 150);
    }

    // Réactiver le scroll du body
    document.body.style.overflow = '';
}

/**
 * Mettre à jour le menu actif
 * @param itemId
 */
window.setActiveMobileMenu = function (itemId) {
    // Réinitialiser tous les items (TAILLES AGRANDIES)
    const allItems = document.querySelectorAll('.menu-item');
    allItems.forEach(item => {
        item.className =
            'menu-item w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white font-semibold transition-all duration-300 transform hover:scale-[1.02]';
    });

    // Activer l'item sélectionné (TAILLES AGRANDIES)
    const activeItem = document.getElementById(itemId);
    if (activeItem) {
        activeItem.className =
            'menu-item w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-[1.02]';
    }
};

/**
 * Gérer le swipe-to-close du menu (glisser vers la droite pour fermer)
 */
function setupSwipeToClose() {
    const sidebar = document.getElementById('menuSidebar');
    if (!sidebar) {
        return;
    }

    let touchStartX = 0;
    let touchCurrentX = 0;
    let isSwiping = false;

    sidebar.addEventListener(
        'touchstart',
        e => {
            touchStartX = e.touches[0].clientX;
            isSwiping = true;
        },
        { passive: true }
    );

    sidebar.addEventListener(
        'touchmove',
        e => {
            if (!isSwiping) {
                return;
            }
            touchCurrentX = e.touches[0].clientX;
            const diffX = touchCurrentX - touchStartX;

            // Si l'utilisateur swipe vers la droite (fermeture)
            if (diffX > 0) {
                const translateAmount = Math.min(diffX, sidebar.offsetWidth);
                sidebar.style.transform = `translateX(${translateAmount}px)`;
                sidebar.style.transition = 'none';
            }
        },
        { passive: true }
    );

    sidebar.addEventListener(
        'touchend',
        () => {
            if (!isSwiping) {
                return;
            }
            isSwiping = false;

            const diffX = touchCurrentX - touchStartX;
            sidebar.style.transition = '';
            sidebar.style.transform = '';

            // Si le swipe est assez fort (>100px), fermer le menu
            if (diffX > 100) {
                toggleMobileMenu();
            }
        },
        { passive: true }
    );
}

/**
 * Injecter le HTML du menu mobile dans la page
 */
function injectMobileMenu() {
    // Vérifier si déjà injecté
    if (document.getElementById('mobileMenu')) {
        console.log('✅ Mobile menu already injected');
        return;
    }

    const menuHTML = `
    <!-- Mobile Sidebar Menu (Slide from right) -->
    <div id="mobileMenu" class="fixed inset-0 z-[60] pointer-events-none">
        <!-- Backdrop -->
        <div id="menuBackdrop" onclick="toggleMobileMenu()"
             class="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-none"></div>

        <!-- Sidebar - PAS DE HEADER, JUSTE LES BOUTONS -->
        <div id="menuSidebar"
             class="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-skali-darker/98 backdrop-blur-xl border-l border-gray-800/50 shadow-2xl transform translate-x-full transition-transform duration-300 overflow-y-auto pointer-events-auto">

            <!-- Menu Items - TAILLES AGRANDIES -->
            <div class="p-6 space-y-3">
                <button onclick="setActiveMobileMenu('menuHome'); toggleMobileMenu(); setTimeout(() => showHome(), 200);" id="menuHome"
                        class="menu-item w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-[1.02]">
                    <i class="fas fa-home text-3xl w-8"></i>
                    <span class="text-xl">Accueil</span>
                </button>

                <button onclick="setActiveMobileMenu('menuDataEntry'); toggleMobileMenu(); setTimeout(() => showDataEntry(), 200);" id="menuDataEntry"
                        class="menu-item w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white font-semibold transition-all duration-300 transform hover:scale-[1.02]">
                    <i class="fas fa-edit text-3xl w-8"></i>
                    <span class="text-xl">Mes Données</span>
                </button>

                <button onclick="setActiveMobileMenu('menuCards'); toggleMobileMenu(); setTimeout(() => showCardGallery(), 200);" id="menuCards"
                        class="menu-item w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white font-semibold transition-all duration-300 transform hover:scale-[1.02]">
                    <i class="fas fa-id-card text-3xl w-8"></i>
                    <span class="text-xl">Mes Cartes</span>
                </button>

                <button onclick="setActiveMobileMenu('menuGoals'); toggleMobileMenu(); setTimeout(() => showGoals(), 200);" id="menuGoals"
                        class="menu-item w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white font-semibold transition-all duration-300 transform hover:scale-[1.02]">
                    <i class="fas fa-bullseye text-3xl w-8"></i>
                    <span class="text-xl">Objectifs</span>
                </button>

                <button onclick="setActiveMobileMenu('menuPerformances'); toggleMobileMenu(); setTimeout(() => showPerformances(), 200);" id="menuPerformances"
                        class="menu-item w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white font-semibold transition-all duration-300 transform hover:scale-[1.02]">
                    <i class="fas fa-chart-line text-3xl w-8"></i>
                    <span class="text-xl">Performances</span>
                </button>

                <button onclick="setActiveMobileMenu('menuVideoAI'); toggleMobileMenu(); setTimeout(() => showVideoAI(), 200);" id="menuVideoAI"
                        class="menu-item w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white font-semibold transition-all duration-300 transform hover:scale-[1.02]">
                    <i class="fas fa-video text-3xl w-8"></i>
                    <span class="text-xl">Analyse Morpho</span>
                </button>

                <button onclick="setActiveMobileMenu('menuNutrition'); toggleMobileMenu(); setTimeout(() => showNutrition(), 200);" id="menuNutrition"
                        class="menu-item w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white font-semibold transition-all duration-300 transform hover:scale-[1.02]">
                    <i class="fas fa-apple-alt text-3xl w-8"></i>
                    <span class="text-xl">Nutrition</span>
                </button>

                <button onclick="setActiveMobileMenu('menuProgramming'); toggleMobileMenu(); setTimeout(() => showProgramming(), 200);" id="menuProgramming"
                        class="menu-item w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white font-semibold transition-all duration-300 transform hover:scale-[1.02]">
                    <i class="fas fa-dumbbell text-3xl w-8"></i>
                    <span class="text-xl">Programmation</span>
                </button>

                <!-- Divider -->
                <div class="border-t border-gray-700 my-4"></div>

                <!-- Logout in menu -->
                <button onclick="PortalAuthOAuth.logout();"
                        class="w-full flex items-center gap-5 px-6 py-5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-red-500/50 transform hover:scale-[1.02]">
                    <i class="fas fa-sign-out-alt text-3xl w-8"></i>
                    <span class="text-xl">Déconnexion</span>
                </button>
            </div>
        </div>
    </div>
    `;

    // Injecter dans le body
    document.body.insertAdjacentHTML('beforeend', menuHTML);
    console.log('✅ Mobile menu injected');
}

// Injecter le menu au chargement
document.addEventListener('DOMContentLoaded', () => {
    injectMobileMenu();
    // Initialiser le swipe-to-close après injection
    setTimeout(setupSwipeToClose, 200);
});

// Si le DOM est déjà chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        injectMobileMenu();
        setTimeout(setupSwipeToClose, 200);
    });
} else {
    setTimeout(() => {
        injectMobileMenu();
        setTimeout(setupSwipeToClose, 200);
    }, 100);
}

console.log('✅ portal-mobile-menu.js chargé avec support swipe-to-close');
