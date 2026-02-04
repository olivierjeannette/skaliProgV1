/**
 * Script de test pour le scraper Peppy
 *
 * Usage: npx tsx scripts/test-peppy-scraper.ts
 */

import { chromium } from 'playwright';

const PEPPY_EMAIL = process.env.PEPPY_EMAIL || 'crossfitskali@gmail.com';
const PEPPY_PASSWORD = process.env.PEPPY_PASSWORD || 'sbAw3gj0AX';

async function testPeppyScraper() {
  console.log('🚀 Starting Peppy scraper test...\n');

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  try {
    // 1. Login
    console.log('📍 Navigating to Peppy...');
    await page.goto('https://pro.peppy.cool', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('🔐 Logging in...');
    const emailInput = await page.$('input[placeholder*="exemple"]')
      || await page.$('input[type="text"]');
    const passwordInput = await page.$('input[type="password"]');

    if (emailInput && passwordInput) {
      await emailInput.fill(PEPPY_EMAIL);
      await passwordInput.fill(PEPPY_PASSWORD);
      await page.click('button:has-text("Connexion")');
      await page.waitForTimeout(5000);
      console.log('✅ Login successful');
    }

    // 2. Naviguer vers le calendrier
    console.log('\n📅 Navigating to calendar...');
    await page.goto('https://pro.peppy.cool/#/activities/calendar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 3. Cliquer sur une séance
    console.log('🖱️ Clicking on a session...');
    const sessionLink = await page.$('a:has-text("place")');
    if (sessionLink) {
      await sessionLink.click();
      await page.waitForTimeout(2000);
    }

    // 4. Extraire les données - VERSION AMÉLIORÉE
    console.log('\n📊 Extracting session data...');

    const sessionData = await page.evaluate(() => {
      const allText = document.body.innerText;

      // Date
      const dateMatch = allText.match(/(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\s+(\d{1,2})\s+(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})/i);

      // Heure
      const timeMatch = allText.match(/(\d{1,2}:\d{2})\s*à\s*(\d{1,2}:\d{2})/);

      // Places
      const placesMatch = allText.match(/Places\s*:\s*(\d+)/i);

      // Participants count
      const participantCountMatch = allText.match(/PARTICIPANT[S]?\s*\((\d+)\)/i);

      // Session name
      let sessionName = '';
      document.querySelectorAll('button, span, div').forEach(el => {
        const text = el.textContent?.trim() || '';
        if (['BUILD', 'HYROX', 'CROSS & FIT', 'PILATES', 'SÉANCE LIBRE', 'POWER', 'TACTICAL', 'Hyrox Team'].includes(text)) {
          sessionName = text;
        }
      });

      // NOUVELLE MÉTHODE: Extraire les participants
      // Les participants sont dans une liste, chaque entrée a un nom et un statut "Non confirmé"
      const participants: { name: string; status: string }[] = [];

      // Chercher la section PARTICIPANT
      const participantSection = allText.split('PARTICIPANT')[1];
      if (participantSection) {
        // Extraire les lignes qui contiennent "Non confirmé" ou "Confirmé"
        const lines = participantSection.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          // Si la ligne contient "Non confirmé" ou juste "Confirmé", le nom est probablement sur la ligne précédente
          if (line === 'Non confirmé' || line === 'Confirmé') {
            // Chercher le nom dans les lignes précédentes
            for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
              const potentialName = lines[j].trim();
              // Un nom valide: contient des lettres, pas de chiffres, pas trop long
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

      // Méthode alternative si la première n'a pas trouvé assez de participants
      if (participants.length === 0 || (participantCountMatch && participants.length < parseInt(participantCountMatch[1]))) {
        // Chercher des patterns "Prénom Nom" dans le texte après PARTICIPANT
        const afterParticipant = allText.split('PARTICIPANT')[1] || '';
        const namePattern = /([A-ZÀ-Ÿ][a-zà-ÿ]+)\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿa-zà-ÿ]*)/g;
        let match;

        while ((match = namePattern.exec(afterParticipant)) !== null) {
          const fullName = match[0];
          // Filtrer les faux positifs
          if (fullName.length > 5 &&
              fullName.length < 40 &&
              !fullName.includes('Faire') &&
              !fullName.includes('Ajouter') &&
              !fullName.includes('Non confirmé') &&
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
        date: dateMatch ? `${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]} ${dateMatch[4]}` : 'Not found',
        time: timeMatch ? `${timeMatch[1]} à ${timeMatch[2]}` : 'Not found',
        places: placesMatch ? parseInt(placesMatch[1]) : 0,
        participantCount: participantCountMatch ? parseInt(participantCountMatch[1]) : 0,
        sessionName: sessionName || 'Not found',
        participants
      };
    });

    console.log('\n========== SESSION DATA ==========');
    console.log(`📆 Date: ${sessionData.date}`);
    console.log(`⏰ Time: ${sessionData.time}`);
    console.log(`🏋️ Session: ${sessionData.sessionName}`);
    console.log(`💺 Places: ${sessionData.places}`);
    console.log(`👥 Participant count: ${sessionData.participantCount}`);
    console.log('\n📋 Participants extracted:');
    if (sessionData.participants.length > 0) {
      sessionData.participants.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.status}`);
      });
    } else {
      console.log('   No participants found');
    }
    console.log('==================================\n');

    // Vérifier si on a trouvé tous les participants
    if (sessionData.participantCount > 0 && sessionData.participants.length === sessionData.participantCount) {
      console.log('✅ SUCCESS: All participants extracted correctly!');
    } else if (sessionData.participants.length > 0) {
      console.log(`⚠️ PARTIAL: Found ${sessionData.participants.length}/${sessionData.participantCount} participants`);
    } else {
      console.log('❌ FAILED: Could not extract participants');
    }

    await page.screenshot({ path: 'peppy-test-final.png' });

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'peppy-error.png' });
  } finally {
    await browser.close();
  }
}

testPeppyScraper();
