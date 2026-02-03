#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PHASE 2 - Enrichissement MASSIF avec variantes d'équipement
Objectif: 350+ exercices avec toutes les combinaisons possibles
"""

import json
import os

BASE_DIR = r'c:\Users\olive\Desktop\Version skaliprog\skaliprog.2.4Dev'
INPUT_FILE = os.path.join(BASE_DIR, 'data', 'exercises-complete-enriched.json')
OUTPUT_FILE = os.path.join(BASE_DIR, 'data', 'exercises-complete.json')

def create_exercise(name, slug, cat_id, subcat, level, force, muscles, equip, diff, tags, energy, sec_muscles=None, can_do_without=False):
    """Helper pour créer un exercice rapidement"""
    ex = {
        "name": name,
        "slug": slug,
        "category_id": cat_id,
        "subcategory": subcat,
        "level": level,
        "force_type": force,
        "mechanic": "compound" if len(muscles) > 1 else "isolation",
        "primary_muscles": muscles,
        "equipment_required": equip,
        "difficulty_rank": diff,
        "typology_tags": tags,
        "energy_system": energy
    }
    if sec_muscles:
        ex["secondary_muscles"] = sec_muscles
    if can_do_without:
        ex["can_do_without_equipment"] = True
    return ex

def main():
    print("[*] PHASE 2 - Enrichissement MASSIF")
    print("[*] Chargement du fichier phase 1...")

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    exercises = data['exercises']
    current = sum(1 for ex in exercises if 'name' in ex)
    print(f"[OK] {current} exercices actuels")

    # ==========================================
    # CATÉGORIE 4: GYMNASTIQUE - Progressions détaillées
    # ==========================================
    print("\n[+] GYMNASTIQUE - Progressions avancees...")

    new_gym = [
        # Front Lever progressions
        create_exercise("Front Lever Tuck", "front_lever_tuck", 4, "gymnastics", "intermediate",
                       "static", ["lats", "core"], ["pull_up_bar"], 7, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Front Lever Advanced Tuck", "front_lever_adv_tuck", 4, "gymnastics", "advanced",
                       "static", ["lats", "core"], ["pull_up_bar"], 8, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Front Lever One Leg", "front_lever_one_leg", 4, "gymnastics", "advanced",
                       "static", ["lats", "core"], ["pull_up_bar"], 9, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Front Lever Straddle", "front_lever_straddle", 4, "gymnastics", "expert",
                       "static", ["lats", "core"], ["pull_up_bar"], 9, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Front Lever Full", "front_lever_full", 4, "gymnastics", "expert",
                       "static", ["lats", "core"], ["pull_up_bar"], 10, ["gym_skills"], "anaerobic_alactic"),

        # Back Lever progressions
        create_exercise("Back Lever Tuck", "back_lever_tuck", 4, "gymnastics", "intermediate",
                       "static", ["shoulders", "back", "core"], ["pull_up_bar"], 7, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Back Lever Straddle", "back_lever_straddle", 4, "gymnastics", "advanced",
                       "static", ["shoulders", "back", "core"], ["pull_up_bar"], 9, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Back Lever Full", "back_lever_full", 4, "gymnastics", "expert",
                       "static", ["shoulders", "back", "core"], ["pull_up_bar"], 10, ["gym_skills"], "anaerobic_alactic"),

        # Planche progressions
        create_exercise("Planche Tuck", "planche_tuck", 4, "gymnastics", "advanced",
                       "static", ["shoulders", "core"], [], 8, ["gym_skills"], "anaerobic_alactic", can_do_without=True),
        create_exercise("Planche Advanced Tuck", "planche_adv_tuck", 4, "gymnastics", "advanced",
                       "static", ["shoulders", "core"], [], 9, ["gym_skills"], "anaerobic_alactic", can_do_without=True),
        create_exercise("Planche Straddle", "planche_straddle", 4, "gymnastics", "expert",
                       "static", ["shoulders", "core"], [], 10, ["gym_skills"], "anaerobic_alactic", can_do_without=True),
        create_exercise("Planche Full", "planche_full", 4, "gymnastics", "expert",
                       "static", ["shoulders", "core"], [], 10, ["gym_skills"], "anaerobic_alactic", can_do_without=True),

        # Autres skills
        create_exercise("Skin the Cat", "skin_the_cat", 4, "gymnastics", "intermediate",
                       "dynamic", ["shoulders", "core"], ["pull_up_bar"], 7, ["gym_skills", "mobility"], "anaerobic_alactic"),
        create_exercise("Dragon Flag", "dragon_flag", 4, "gymnastics", "advanced",
                       "pull", ["abs", "core"], ["bench"], 9, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Typewriter Pull-Ups", "typewriter_pullups", 4, "calisthenics", "advanced",
                       "pull", ["lats", "biceps"], ["pull_up_bar"], 8, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Archer Pull-Ups", "archer_pullups", 4, "calisthenics", "advanced",
                       "pull", ["lats", "biceps"], ["pull_up_bar"], 8, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Commando Pull-Ups", "commando_pullups", 4, "calisthenics", "intermediate",
                       "pull", ["lats", "biceps"], ["pull_up_bar"], 7, ["gym_skills", "tactical"], "anaerobic_alactic"),
    ]

    # ==========================================
    # CATÉGORIE 8: CARDIO - Variantes massives
    # ==========================================
    print("[+] CARDIO - Variantes plyometriques...")

    new_cardio = [
        # Box Jumps VARIANTES
        create_exercise("Box Jump 24 inch", "box_jump_24", 8, "cardio", "intermediate",
                       "push", ["legs"], ["box"], 6, ["power", "metcon"], "anaerobic_alactic"),
        create_exercise("Box Jump 30 inch", "box_jump_30", 8, "cardio", "advanced",
                       "push", ["legs"], ["box"], 7, ["power", "metcon"], "anaerobic_alactic"),
        create_exercise("Box Jump 36 inch", "box_jump_36", 8, "cardio", "expert",
                       "push", ["legs"], ["box"], 8, ["power"], "anaerobic_alactic"),
        create_exercise("Lateral Box Jump", "lateral_box_jump", 8, "cardio", "intermediate",
                       "push", ["legs"], ["box"], 6, ["power", "metcon"], "anaerobic_alactic"),
        create_exercise("Box Jump Over", "box_jump_over", 8, "cardio", "intermediate",
                       "push", ["legs"], ["box"], 6, ["metcon"], "anaerobic_lactic"),
        create_exercise("Depth Jump", "depth_jump", 8, "cardio", "advanced",
                       "push", ["legs"], ["box"], 8, ["power"], "anaerobic_alactic"),
        create_exercise("Box Step-Over", "box_step_over", 8, "cardio", "beginner",
                       "push", ["legs"], ["box"], 4, ["metcon"], "anaerobic_lactic"),

        # Burpees VARIANTES
        create_exercise("Burpee + Pull-Up", "burpee_pullup", 8, "cardio", "intermediate",
                       "push", ["full_body"], ["pull_up_bar"], 7, ["metcon", "tactical"], "anaerobic_lactic", can_do_without=True),
        create_exercise("Burpee + Box Jump", "burpee_box_jump", 8, "cardio", "intermediate",
                       "push", ["full_body"], ["box"], 7, ["metcon"], "anaerobic_lactic"),
        create_exercise("Burpee + Tuck Jump", "burpee_tuck_jump", 8, "cardio", "intermediate",
                       "push", ["full_body"], [], 6, ["metcon", "power"], "anaerobic_lactic", can_do_without=True),
        create_exercise("Burpee + Dumbbell", "burpee_dumbbell", 8, "cardio", "intermediate",
                       "push", ["full_body"], ["dumbbells"], 6, ["metcon"], "anaerobic_lactic"),
        create_exercise("8-Count Bodybuilder", "8_count_bodybuilder", 8, "cardio", "advanced",
                       "push", ["full_body"], [], 7, ["metcon", "tactical"], "anaerobic_lactic", can_do_without=True),

        # Jumps & Plyos
        create_exercise("Broad Jump", "broad_jump", 8, "cardio", "beginner",
                       "push", ["legs"], [], 5, ["power"], "anaerobic_alactic", can_do_without=True),
        create_exercise("Lateral Jump", "lateral_jump", 8, "cardio", "beginner",
                       "push", ["legs"], [], 5, ["power"], "anaerobic_alactic", can_do_without=True),
        create_exercise("Tuck Jump", "tuck_jump", 8, "cardio", "intermediate",
                       "push", ["legs", "core"], [], 6, ["power"], "anaerobic_alactic", can_do_without=True),
        create_exercise("Squat Jump", "squat_jump", 8, "cardio", "beginner",
                       "push", ["legs"], [], 5, ["power", "metcon"], "anaerobic_lactic", can_do_without=True),
        create_exercise("Split Jump", "split_jump", 8, "cardio", "intermediate",
                       "push", ["legs"], [], 6, ["power"], "anaerobic_lactic", can_do_without=True),
        create_exercise("Single Leg Hop", "single_leg_hop", 8, "cardio", "beginner",
                       "push", ["legs"], [], 5, ["power"], "anaerobic_alactic", can_do_without=True),
        create_exercise("Pogo Jumps", "pogo_jumps", 8, "cardio", "beginner",
                       "push", ["calves"], [], 4, ["power"], "anaerobic_lactic", can_do_without=True),

        # Ski Erg variants
        create_exercise("Ski Erg 500m", "ski_erg_500m", 8, "cardio", "beginner",
                       "pull", ["back", "shoulders"], ["ski_erg"], 5, ["spe_run_bike"], "anaerobic_lactic"),
        create_exercise("Ski Erg 2000m", "ski_erg_2000m", 8, "cardio", "advanced",
                       "pull", ["back", "shoulders"], ["ski_erg"], 7, ["spe_run_bike"], "aerobic"),
        create_exercise("Ski Erg Intervals", "ski_erg_intervals", 8, "cardio", "intermediate",
                       "pull", ["back", "shoulders"], ["ski_erg"], 6, ["metcon", "spe_run_bike"], "mixed"),

        # Rowing variants
        create_exercise("Rowing 500m", "rowing_500m", 8, "cardio", "beginner",
                       "pull", ["back", "legs"], ["rowing_erg"], 5, ["spe_run_bike"], "anaerobic_lactic"),
        create_exercise("Rowing 2000m", "rowing_2000m", 8, "cardio", "intermediate",
                       "pull", ["back", "legs"], ["rowing_erg"], 6, ["spe_run_bike"], "aerobic"),
        create_exercise("Rowing Intervals", "rowing_intervals", 8, "cardio", "intermediate",
                       "pull", ["back", "legs"], ["rowing_erg"], 6, ["metcon"], "mixed"),

        # Sled work
        create_exercise("Sled Drag Backward", "sled_drag_backward", 8, "cardio", "intermediate",
                       "pull", ["legs", "back"], ["sled"], 6, ["tactical"], "anaerobic_lactic"),
        create_exercise("Sled Row", "sled_row", 8, "cardio", "intermediate",
                       "pull", ["back", "legs"], ["sled"], 6, ["tactical"], "anaerobic_lactic"),

        # Jump Rope variants
        create_exercise("Jump Rope Triple Unders", "jump_rope_triple_unders", 8, "cardio", "expert",
                       "push", ["calves", "shoulders"], ["jump_rope"], 9, ["gym_skills"], "anaerobic_lactic"),
        create_exercise("Jump Rope Crossovers", "jump_rope_crossovers", 8, "cardio", "advanced",
                       "push", ["calves", "shoulders"], ["jump_rope"], 8, ["gym_skills"], "anaerobic_lactic"),
    ]

    # ==========================================
    # CATÉGORIE 9: CORE - Variantes carries & rotations
    # ==========================================
    print("[+] CORE - Carries, rotations, anti-rotation...")

    new_core = [
        # Planks variants
        create_exercise("RKC Plank", "rkc_plank", 9, "core", "intermediate",
                       "static", ["abs", "core"], [], 6, ["gym_skills"], "anaerobic_alactic", can_do_without=True),
        create_exercise("Long Lever Plank", "long_lever_plank", 9, "core", "advanced",
                       "static", ["abs", "core"], [], 7, ["gym_skills"], "anaerobic_alactic", can_do_without=True),
        create_exercise("Feet Elevated Plank", "feet_elevated_plank", 9, "core", "intermediate",
                       "static", ["abs", "core"], ["box"], 6, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Plank to Push-Up", "plank_to_pushup", 9, "core", "beginner",
                       "push", ["abs", "chest"], [], 5, ["metcon"], "anaerobic_lactic", can_do_without=True),
        create_exercise("Plank Jacks", "plank_jacks", 9, "core", "beginner",
                       "dynamic", ["abs", "core"], [], 5, ["metcon"], "anaerobic_lactic", can_do_without=True),
        create_exercise("Mountain Climbers", "mountain_climbers", 9, "core", "beginner",
                       "dynamic", ["abs", "core"], [], 4, ["metcon"], "anaerobic_lactic", can_do_without=True),

        # Carries
        create_exercise("Suitcase Carry", "suitcase_carry", 9, "core", "beginner",
                       "static", ["core", "obliques"], ["dumbbell"], 5, ["tactical"], "anaerobic_lactic"),
        create_exercise("Suitcase Carry Kettlebell", "suitcase_carry_kb", 9, "core", "beginner",
                       "static", ["core", "obliques"], ["kettlebell"], 5, ["tactical"], "anaerobic_lactic"),
        create_exercise("Waiter Walk", "waiter_walk", 9, "core", "intermediate",
                       "static", ["core", "shoulders"], ["kettlebell"], 6, ["tactical", "mobility"], "anaerobic_lactic"),
        create_exercise("Overhead Carry", "overhead_carry", 9, "core", "intermediate",
                       "static", ["core", "shoulders"], ["dumbbell"], 6, ["tactical"], "anaerobic_lactic"),
        create_exercise("Zercher Carry", "zercher_carry", 9, "core", "advanced",
                       "static", ["core", "biceps"], ["barbell"], 7, ["strongman"], "anaerobic_lactic"),

        # Rotations & Anti-rotation
        create_exercise("Cable Woodchop", "cable_woodchop", 9, "core", "beginner",
                       "dynamic", ["obliques", "core"], ["cable_machine"], 4, ["bodybuilding"], "anaerobic_lactic"),
        create_exercise("Landmine Rotation", "landmine_rotation", 9, "core", "intermediate",
                       "dynamic", ["obliques", "core"], ["barbell", "landmine"], 5, ["functional"], "anaerobic_lactic"),
        create_exercise("Med Ball Slam", "med_ball_slam", 9, "core", "beginner",
                       "dynamic", ["abs", "core"], ["medicine_ball"], 5, ["power", "metcon"], "anaerobic_lactic"),
        create_exercise("Med Ball Russian Twist", "med_ball_russian_twist", 9, "core", "beginner",
                       "pull", ["obliques"], ["medicine_ball"], 4, ["bodybuilding"], "anaerobic_lactic"),

        # Advanced core
        create_exercise("V-Ups", "v_ups", 9, "core", "intermediate",
                       "pull", ["abs"], [], 6, ["gym_skills"], "anaerobic_lactic", can_do_without=True),
        create_exercise("Windshield Wipers", "windshield_wipers", 9, "core", "advanced",
                       "pull", ["abs", "obliques"], ["pull_up_bar"], 8, ["gym_skills"], "anaerobic_alactic"),
        create_exercise("Turkish Sit-Up", "turkish_situp", 9, "core", "intermediate",
                       "dynamic", ["abs", "core"], ["kettlebell"], 6, ["functional"], "anaerobic_alactic"),
        create_exercise("Toes to Sky", "toes_to_sky", 9, "core", "intermediate",
                       "pull", ["abs"], [], 6, ["bodybuilding"], "anaerobic_lactic", can_do_without=True),
    ]

    # ==========================================
    # CATÉGORIE 10: MOBILITÉ - Flows & CARs
    # ==========================================
    print("[+] MOBILITE - Flows, CARs, stretches specifiques...")

    new_mobility = [
        # Stretches
        create_exercise("Couch Stretch", "couch_stretch", 10, "mobility", "beginner",
                       "static", ["hip_flexors", "quadriceps"], [], 3, ["mobility"], "aerobic", can_do_without=True),
        create_exercise("Frog Stretch", "frog_stretch", 10, "mobility", "beginner",
                       "static", ["hip_flexors", "adductors"], [], 3, ["mobility"], "aerobic", can_do_without=True),
        create_exercise("Cossack Squat", "cossack_squat", 10, "mobility", "intermediate",
                       "dynamic", ["adductors", "hips"], [], 5, ["mobility", "functional"], "aerobic", can_do_without=True),
        create_exercise("World's Greatest Stretch", "worlds_greatest_stretch", 10, "mobility", "beginner",
                       "dynamic", ["hip_flexors", "hamstrings", "spine"], [], 4, ["mobility"], "aerobic", can_do_without=True),

        # CARs (Controlled Articular Rotations)
        create_exercise("Hip CARs", "hip_cars", 10, "mobility", "beginner",
                       "dynamic", ["hips"], [], 3, ["mobility"], "aerobic", can_do_without=True),
        create_exercise("Shoulder CARs", "shoulder_cars", 10, "mobility", "beginner",
                       "dynamic", ["shoulders"], [], 3, ["mobility"], "aerobic", can_do_without=True),
        create_exercise("Scapular CARs", "scapular_cars", 10, "mobility", "beginner",
                       "dynamic", ["scapula", "upper_back"], [], 3, ["mobility"], "aerobic", can_do_without=True),
        create_exercise("Ankle Mobility Drill", "ankle_mobility_drill", 10, "mobility", "beginner",
                       "dynamic", ["ankles"], [], 2, ["mobility"], "aerobic", can_do_without=True),

        # Flows & Sequences
        create_exercise("Wall Slides", "wall_slides", 10, "mobility", "beginner",
                       "dynamic", ["shoulders", "upper_back"], [], 2, ["mobility"], "aerobic", can_do_without=True),
        create_exercise("Wrist Mobility Flow", "wrist_mobility_flow", 10, "mobility", "beginner",
                       "dynamic", ["wrists"], [], 2, ["mobility"], "aerobic", can_do_without=True),
        create_exercise("Spine Waves", "spine_waves", 10, "mobility", "beginner",
                       "dynamic", ["spine", "core"], [], 3, ["mobility", "pilates"], "aerobic", can_do_without=True),
        create_exercise("Hip Flow", "hip_flow", 10, "mobility", "intermediate",
                       "dynamic", ["hips"], [], 4, ["mobility"], "aerobic", can_do_without=True),
    ]

    # ==========================================
    # CATÉGORIE 11: FONCTIONNEL - KB & Sandbag complexes
    # ==========================================
    print("[+] FONCTIONNEL - KB complexes, Sandbag, combinaisons...")

    new_functional = [
        # Kettlebell variants
        create_exercise("KB Windmill", "kb_windmill", 11, "functional", "advanced",
                       "push", ["core", "shoulders"], ["kettlebell"], 8, ["mobility", "tactical"], "anaerobic_alactic"),
        create_exercise("KB Figure 8", "kb_figure_8", 11, "functional", "beginner",
                       "dynamic", ["core", "forearms"], ["kettlebell"], 5, ["functional"], "anaerobic_lactic"),
        create_exercise("KB Halo", "kb_halo", 11, "functional", "beginner",
                       "dynamic", ["shoulders", "core"], ["kettlebell"], 4, ["mobility", "functional"], "anaerobic_lactic"),
        create_exercise("KB High Pull", "kb_high_pull", 11, "functional", "intermediate",
                       "pull", ["traps", "shoulders"], ["kettlebell"], 6, ["power"], "anaerobic_alactic"),
        create_exercise("Double KB Front Squat", "double_kb_front_squat", 11, "functional", "intermediate",
                       "push", ["quadriceps", "core"], ["kettlebells"], 6, ["strength"], "anaerobic_alactic"),
        create_exercise("Double KB Clean", "double_kb_clean", 11, "functional", "advanced",
                       "pull", ["legs", "shoulders"], ["kettlebells"], 8, ["power"], "anaerobic_alactic"),
        create_exercise("Double KB Jerk", "double_kb_jerk", 11, "functional", "advanced",
                       "push", ["shoulders", "legs"], ["kettlebells"], 8, ["power"], "anaerobic_alactic"),
        create_exercise("KB Renegade Row", "kb_renegade_row", 11, "functional", "intermediate",
                       "pull", ["back", "core"], ["kettlebells"], 7, ["functional"], "anaerobic_alactic"),

        # Sandbag variants
        create_exercise("Sandbag Over Shoulder", "sandbag_over_shoulder", 11, "functional", "intermediate",
                       "pull", ["full_body"], ["sandbag"], 7, ["strongman", "tactical"], "anaerobic_alactic"),
        create_exercise("Sandbag Zercher Carry", "sandbag_zercher_carry", 11, "functional", "advanced",
                       "static", ["core", "biceps"], ["sandbag"], 8, ["strongman"], "anaerobic_lactic"),
        create_exercise("Sandbag Rotational Lunge", "sandbag_rotational_lunge", 11, "functional", "intermediate",
                       "push", ["legs", "core"], ["sandbag"], 6, ["functional"], "anaerobic_lactic"),
        create_exercise("Sandbag Bear Hug Carry", "sandbag_bearhug_carry", 11, "functional", "intermediate",
                       "static", ["core", "arms"], ["sandbag"], 6, ["tactical"], "anaerobic_lactic"),

        # Complexes
        create_exercise("Barbell Complex (Clean + Front Squat + Press)", "barbell_complex_clean_squat_press", 11, "functional", "advanced",
                       "push", ["full_body"], ["barbell"], 9, ["metcon", "weightlifting"], "anaerobic_lactic"),
        create_exercise("Cluster (Clean + Thruster)", "cluster", 11, "functional", "advanced",
                       "push", ["full_body"], ["barbell"], 8, ["metcon", "weightlifting"], "anaerobic_lactic"),
        create_exercise("Bear Complex", "bear_complex", 11, "functional", "expert",
                       "push", ["full_body"], ["barbell"], 10, ["metcon", "weightlifting"], "anaerobic_lactic"),
    ]

    # ==========================================
    # CATÉGORIE 12: STRONGMAN - Plus de carries & events
    # ==========================================
    print("[+] STRONGMAN - Events et carries...")

    new_strongman = [
        create_exercise("Duck Walk", "duck_walk", 12, "strongman", "advanced",
                       "static", ["legs", "core"], ["trap_bar"], 8, ["strongman"], "anaerobic_lactic"),
        create_exercise("Stone to Shoulder (Series)", "stone_to_shoulder_series", 12, "strongman", "expert",
                       "pull", ["full_body"], ["atlas_stone"], 10, ["strongman"], "anaerobic_alactic"),
        create_exercise("Conan's Wheel", "conans_wheel", 12, "strongman", "expert",
                       "static", ["core", "shoulders"], ["conans_wheel"], 10, ["strongman"], "anaerobic_lactic"),
        create_exercise("Arm Over Arm Pull", "arm_over_arm_pull", 12, "strongman", "advanced",
                       "pull", ["back", "arms"], ["rope", "sled"], 8, ["strongman"], "anaerobic_lactic"),
        create_exercise("Shield Carry", "shield_carry", 12, "strongman", "intermediate",
                       "static", ["core", "shoulders"], ["shield"], 7, ["strongman", "tactical"], "anaerobic_lactic"),
        create_exercise("Sandbag Load to Platform", "sandbag_load_platform", 12, "strongman", "intermediate",
                       "pull", ["legs", "back"], ["sandbag", "platform"], 7, ["strongman"], "anaerobic_alactic"),
    ]

    # INSERTION dans le JSON
    print("\n[*] Insertion des nouveaux exercices...")

    # Stratégie: insérer avant chaque catégorie suivante
    categories = [
        ("GYMNASTIQUE", new_gym),
        ("CARDIO", new_cardio),
        ("CORE", new_core),
        ("MOBILITÉ", new_mobility),
        ("FONCTIONNEL", new_functional),
        ("STRONGMAN", new_strongman)
    ]

    for cat_name, new_exercises in categories:
        for idx, ex in enumerate(exercises):
            if 'comment' in ex and cat_name in ex.get('category_name', ''):
                # Trouver la prochaine catégorie
                insert_idx = idx
                for i in range(idx+1, len(exercises)):
                    if 'comment' in exercises[i] and 'category_name' in exercises[i]:
                        insert_idx = i
                        break
                else:
                    # Dernière catégorie, insérer à la fin
                    insert_idx = len(exercises)

                # Insérer en ordre inversé
                for new_ex in reversed(new_exercises):
                    exercises.insert(insert_idx, new_ex)
                break

    # Compter et sauvegarder
    final_count = sum(1 for ex in exercises if 'name' in ex)
    data['total_exercises'] = final_count
    data['exercises'] = exercises
    data['version'] = "2.1"
    data['last_updated'] = "2025-01-29"

    print(f"\n[*] Sauvegarde du fichier final...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] TERMINE!")
    print(f"   Avant: {current} exercices")
    print(f"   Apres: {final_count} exercices")
    print(f"   Ajoutes: +{final_count - current}")
    print(f"\n   Gymnastique: +{len(new_gym)}")
    print(f"   Cardio/Plyo: +{len(new_cardio)}")
    print(f"   Core: +{len(new_core)}")
    print(f"   Mobilite: +{len(new_mobility)}")
    print(f"   Fonctionnel: +{len(new_functional)}")
    print(f"   Strongman: +{len(new_strongman)}")
    print(f"\n[*] Fichier final: {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
