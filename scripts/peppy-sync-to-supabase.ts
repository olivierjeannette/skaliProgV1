/**
 * Script de synchronisation Peppy -> Supabase
 * Utilisé par GitHub Actions pour sync automatique
 *
 * Usage: npx tsx scripts/peppy-sync-to-supabase.ts [hour]
 */

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const PEPPY_EMAIL = process.env.PEPPY_EMAIL!;
const PEPPY_PASSWORD = process.env.PEPPY_PASSWORD!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

interface PeppyParticipant {
  name: string;
  status: string;
}

interface PeppySession {
  date: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  session_name: string;
  total_places: number;
  participant_count: number;
  participants: PeppyParticipant[];
  scraped_at: string;
}

// Obtenir l'heure française (UTC+1 ou UTC+2 en été)
function getFrenchHour(): number {
  const now = new Date();
  // Créer une date en timezone Paris
  const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  return parisTime.getHours();
}

async function scrapePeppy(targetHour?: number): Promise<PeppySession | null> {
  console.log('🚀 Starting Peppy scraper...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Login
    console.log('🔐 Logging in...');
    await page.goto('https://pro.peppy.cool', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const emailInput = await page.$('input[placeholder*="exemple"]') || await page.$('input[type="text"]');
    const passwordInput = await page.$('input[type="password"]');

    if (emailInput && passwordInput) {
      await emailInput.fill(PEPPY_EMAIL);
      await passwordInput.fill(PEPPY_PASSWORD);
      await page.click('button:has-text("Connexion")');
      await page.waitForTimeout(5000);
    }

    // Navigate to calendar
    console.log('📅 Navigating to calendar...');
    await page.goto('https://pro.peppy.cool/#/activities/calendar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Click on session - utilise l'heure française
    const hour = targetHour ?? getFrenchHour();
    const hourStr = hour.toString().padStart(2, '0');

    console.log(`🖱️ Looking for session at ${hour}:00...`);

    let sessionLink = await page.$(`a:has-text("${hourStr}:00"):has-text("place")`);
    if (!sessionLink) {
      sessionLink = await page.$(`a:has-text("${hour}:00"):has-text("place")`);
    }
    if (!sessionLink) {
      sessionLink = await page.$('a:has-text("place")');
    }

    if (sessionLink) {
      await sessionLink.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('❌ No session found');
      return null;
    }

    // Extract data
    console.log('📊 Extracting session data...');

    const sessionData = await page.evaluate(() => {
      const allText = document.body.innerText;

      // Date
      const dateMatch = allText.match(/(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\s+(\d{1,2})\s+(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})/i);

      // Time
      const timeMatch = allText.match(/(\d{1,2}:\d{2})\s*à\s*(\d{1,2}:\d{2})/);

      // Places
      const placesMatch = allText.match(/Places\s*:\s*(\d+)/i);

      // Participant count
      const participantCountMatch = allText.match(/PARTICIPANT[S]?\s*\((\d+)\)/i);

      // Session name
      let sessionName = '';
      const sessionNames = ['BUILD', 'HYROX', 'CROSS & FIT', 'PILATES', 'SÉANCE LIBRE', 'POWER', 'TACTICAL', 'Hyrox Team'];
      document.querySelectorAll('button, span, div').forEach(el => {
        const text = el.textContent?.trim() || '';
        if (sessionNames.includes(text)) {
          sessionName = text;
        }
      });

      // Participants
      const participants: { name: string; status: string }[] = [];
      const participantSection = allText.split('PARTICIPANT')[1];

      if (participantSection) {
        const lines = participantSection.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === 'Non confirmé' || line === 'Confirmé') {
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

      return {
        dayOfWeek: dateMatch ? dateMatch[1] : '',
        date: dateMatch ? `${dateMatch[4]}-${['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'].indexOf(dateMatch[3])+1}-${dateMatch[2].padStart(2,'0')}` : '',
        startTime: timeMatch ? timeMatch[1] : '',
        endTime: timeMatch ? timeMatch[2] : '',
        totalPlaces: placesMatch ? parseInt(placesMatch[1]) : 0,
        participantCount: participantCountMatch ? parseInt(participantCountMatch[1]) : 0,
        sessionName,
        participants
      };
    });

    console.log(`✅ Extracted: ${sessionData.sessionName} - ${sessionData.participants.length} participants`);

    return {
      date: sessionData.date,
      day_of_week: sessionData.dayOfWeek,
      start_time: sessionData.startTime,
      end_time: sessionData.endTime,
      session_name: sessionData.sessionName,
      total_places: sessionData.totalPlaces,
      participant_count: sessionData.participantCount,
      participants: sessionData.participants,
      scraped_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  } finally {
    await browser.close();
  }
}

async function saveToSupabase(session: PeppySession): Promise<boolean> {
  console.log('💾 Saving to Supabase...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Upsert (insert or update) based on date + start_time
  const { error } = await supabase
    .from('peppy_sessions')
    .upsert({
      date: session.date,
      day_of_week: session.day_of_week,
      start_time: session.start_time,
      end_time: session.end_time,
      session_name: session.session_name,
      total_places: session.total_places,
      participant_count: session.participant_count,
      participants: session.participants,
      scraped_at: session.scraped_at
    }, {
      onConflict: 'date,start_time'
    });

  if (error) {
    console.error('❌ Supabase error:', error);
    return false;
  }

  console.log('✅ Saved to Supabase');
  return true;
}

async function main() {
  // Check environment
  if (!PEPPY_EMAIL || !PEPPY_PASSWORD) {
    console.error('❌ Missing PEPPY_EMAIL or PEPPY_PASSWORD');
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  // Get optional hour argument
  const hourArg = process.argv[2];
  const targetHour = hourArg ? parseInt(hourArg) : undefined;

  console.log(`\n📅 Peppy Sync - ${new Date().toISOString()}`);
  console.log(`🎯 Target hour: ${targetHour ?? 'current'}\n`);

  // Scrape Peppy
  const session = await scrapePeppy(targetHour);

  if (!session) {
    console.log('⚠️ No session data to save');
    process.exit(0);
  }

  // Save to Supabase
  const saved = await saveToSupabase(session);

  if (!saved) {
    process.exit(1);
  }

  console.log('\n✅ Sync completed successfully!');
}

main();
