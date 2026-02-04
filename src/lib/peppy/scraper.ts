import { chromium, Browser, Page } from 'playwright';

export interface PeppyParticipant {
  name: string;
  status: string; // "Non confirmé", "Confirmé", etc.
}

export interface PeppySession {
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  sessionName: string;
  totalPlaces: number;
  participantCount: number;
  participants: PeppyParticipant[];
  scrapedAt: string;
}

export interface PeppyScrapeResult {
  success: boolean;
  session?: PeppySession;
  error?: string;
}

const PEPPY_URL = 'https://pro.peppy.cool';
const PEPPY_CALENDAR_URL = `${PEPPY_URL}/#/activities/calendar`;

export class PeppyScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(
    private email: string,
    private password: string
  ) {}

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
    });
    this.page = await this.browser.newPage();
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  async login(): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      await this.page.goto(PEPPY_URL, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);

      // Chercher les champs de login
      const emailInput = await this.page.$('input[placeholder*="exemple"]')
        || await this.page.$('input[type="text"]');
      const passwordInput = await this.page.$('input[type="password"]');

      if (!emailInput || !passwordInput) {
        console.error('[Peppy] Login fields not found');
        return false;
      }

      await emailInput.fill(this.email);
      await passwordInput.fill(this.password);

      // Cliquer sur Connexion
      await this.page.click('button:has-text("Connexion")');
      await this.page.waitForTimeout(5000);

      const currentUrl = this.page.url();
      const success = currentUrl.includes('dashboard') || currentUrl.includes('#/');

      if (success) {
        console.log('[Peppy] Login successful');
      } else {
        console.error('[Peppy] Login may have failed, URL:', currentUrl);
      }

      return success;
    } catch (error) {
      console.error('[Peppy] Login error:', error);
      return false;
    }
  }

  async navigateToCalendar(): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      await this.page.goto(PEPPY_CALENDAR_URL, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(3000);

      const content = await this.page.content();
      const hasCalendar = content.includes('Calendrier') || content.includes('calendar');

      console.log('[Peppy] Calendar loaded:', hasCalendar);
      return hasCalendar;
    } catch (error) {
      console.error('[Peppy] Calendar navigation error:', error);
      return false;
    }
  }

  /**
   * Trouve et clique sur la séance correspondant au jour et à l'heure donnés
   */
  async findAndClickSession(targetHour: number): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    const hourStr = targetHour.toString();
    const hourStrPadded = targetHour.toString().padStart(2, '0');

    console.log(`[Peppy] Looking for session at ${hourStr}:00`);

    try {
      // Chercher un lien de séance qui correspond à l'heure
      const sessionLink = await this.page.$(`a:has-text("${hourStrPadded}:00"):has-text("place")`);

      if (sessionLink) {
        await sessionLink.click();
        await this.page.waitForTimeout(2000);
        console.log(`[Peppy] Clicked on session at ${hourStr}:00`);
        return true;
      }

      // Essayer avec l'heure sans padding
      const sessionLinkAlt = await this.page.$(`a:has-text("${hourStr}:00"):has-text("place")`);
      if (sessionLinkAlt) {
        await sessionLinkAlt.click();
        await this.page.waitForTimeout(2000);
        console.log(`[Peppy] Clicked on session at ${hourStr}:00`);
        return true;
      }

      // Fallback: cliquer sur n'importe quelle séance
      console.log('[Peppy] No session found for specified hour, trying first available...');
      const anySession = await this.page.$('a:has-text("place")');
      if (anySession) {
        await anySession.click();
        await this.page.waitForTimeout(2000);
        console.log('[Peppy] Clicked on first available session');
        return true;
      }

      console.log('[Peppy] No clickable session found');
      return false;
    } catch (error) {
      console.error('[Peppy] Error finding session:', error);
      return false;
    }
  }

  /**
   * Extrait les participants du panel de droite
   */
  async extractParticipants(): Promise<PeppySession | null> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      await this.page.waitForTimeout(1000);

      const sessionData = await this.page.evaluate(() => {
        const allText = document.body.innerText;

        // Date (format "Lundi 02 Février 2026")
        const dateMatch = allText.match(/(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\s+(\d{1,2})\s+(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})/i);

        // Heure (format "09:00 à 10:00")
        const timeMatch = allText.match(/(\d{1,2}:\d{2})\s*à\s*(\d{1,2}:\d{2})/);

        // Places (format "Places : 12")
        const placesMatch = allText.match(/Places\s*:\s*(\d+)/i);

        // Nombre de participants (format "PARTICIPANT (3)")
        const participantCountMatch = allText.match(/PARTICIPANT[S]?\s*\((\d+)\)/i);

        // Nom de la séance
        let sessionName = '';
        const sessionNames = ['BUILD', 'HYROX', 'CROSS & FIT', 'PILATES', 'SÉANCE LIBRE', 'POWER', 'TACTICAL', 'Hyrox Team'];
        document.querySelectorAll('button, span, div').forEach(el => {
          const text = el.textContent?.trim() || '';
          if (sessionNames.includes(text)) {
            sessionName = text;
          }
        });

        // Extraire les participants
        const participants: { name: string; status: string }[] = [];

        // Méthode 1: Chercher les lignes après "PARTICIPANT" avec "Non confirmé" ou "Confirmé"
        const participantSection = allText.split('PARTICIPANT')[1];
        if (participantSection) {
          const lines = participantSection.split('\n');

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line === 'Non confirmé' || line === 'Confirmé') {
              // Le nom est sur une ligne précédente
              for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
                const potentialName = lines[j].trim();
                if (potentialName.length > 3 &&
                    potentialName.length < 50 &&
                    /^[A-ZÀ-Ÿa-zà-ÿ\s-]+$/.test(potentialName) &&
                    !potentialName.includes('PARTICIPANT') &&
                    !potentialName.includes('STATUT') &&
                    !potentialName.includes('Faire') &&
                    !potentialName.includes('Ajouter') &&
                    !potentialName.includes('Rafraîchir') &&
                    !potentialName.includes('Programmer')) {
                  if (!participants.some(p => p.name === potentialName)) {
                    participants.push({ name: potentialName, status: line });
                  }
                  break;
                }
              }
            }
          }
        }

        // Méthode 2: Si pas assez de participants, chercher par pattern
        if (participants.length === 0 || (participantCountMatch && participants.length < parseInt(participantCountMatch[1]))) {
          const afterParticipant = allText.split('PARTICIPANT')[1] || '';
          const namePattern = /([A-ZÀ-Ÿ][a-zà-ÿ]+)\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿa-zà-ÿ]*)/g;
          let match;

          while ((match = namePattern.exec(afterParticipant)) !== null) {
            const fullName = match[0];
            if (fullName.length > 5 &&
                fullName.length < 40 &&
                !fullName.includes('Faire') &&
                !fullName.includes('Ajouter') &&
                !fullName.includes('Programmer') &&
                !fullName.includes('Hyrox') &&
                !fullName.includes('BUILD')) {
              if (!participants.some(p => p.name === fullName)) {
                participants.push({ name: fullName, status: 'Non confirmé' });
              }
            }
          }
        }

        return {
          dayOfWeek: dateMatch ? dateMatch[1] : '',
          date: dateMatch ? `${dateMatch[2]} ${dateMatch[3]} ${dateMatch[4]}` : '',
          startTime: timeMatch ? timeMatch[1] : '',
          endTime: timeMatch ? timeMatch[2] : '',
          totalPlaces: placesMatch ? parseInt(placesMatch[1]) : 0,
          participantCount: participantCountMatch ? parseInt(participantCountMatch[1]) : 0,
          sessionName,
          participants
        };
      });

      console.log(`[Peppy] Extracted: ${sessionData.sessionName} - ${sessionData.participants.length} participants`);

      return {
        ...sessionData,
        scrapedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[Peppy] Error extracting participants:', error);
      return null;
    }
  }

  /**
   * Récupère les participants de la séance en cours (heure actuelle)
   */
  async getCurrentSessionParticipants(): Promise<PeppyScrapeResult> {
    try {
      await this.init();

      const loggedIn = await this.login();
      if (!loggedIn) {
        return { success: false, error: 'Login failed' };
      }

      const navigated = await this.navigateToCalendar();
      if (!navigated) {
        return { success: false, error: 'Failed to navigate to calendar' };
      }

      const currentHour = new Date().getHours();
      const sessionFound = await this.findAndClickSession(currentHour);
      if (!sessionFound) {
        return { success: false, error: `No session found for ${currentHour}h` };
      }

      const session = await this.extractParticipants();
      if (!session) {
        return { success: false, error: 'Failed to extract participants' };
      }

      return { success: true, session };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      await this.close();
    }
  }

  /**
   * Récupère les participants d'une séance à une heure spécifique
   */
  async getSessionParticipantsByHour(hour: number): Promise<PeppyScrapeResult> {
    try {
      await this.init();

      const loggedIn = await this.login();
      if (!loggedIn) {
        return { success: false, error: 'Login failed' };
      }

      const navigated = await this.navigateToCalendar();
      if (!navigated) {
        return { success: false, error: 'Failed to navigate to calendar' };
      }

      const sessionFound = await this.findAndClickSession(hour);
      if (!sessionFound) {
        return { success: false, error: `No session found for ${hour}h` };
      }

      const session = await this.extractParticipants();
      if (!session) {
        return { success: false, error: 'Failed to extract participants' };
      }

      return { success: true, session };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      await this.close();
    }
  }
}

// Fonctions utilitaires
export async function scrapePeppyCurrentSession(
  email: string,
  password: string
): Promise<PeppyScrapeResult> {
  const scraper = new PeppyScraper(email, password);
  return scraper.getCurrentSessionParticipants();
}

export async function scrapePeppySessionByHour(
  email: string,
  password: string,
  hour: number
): Promise<PeppyScrapeResult> {
  const scraper = new PeppyScraper(email, password);
  return scraper.getSessionParticipantsByHour(hour);
}
