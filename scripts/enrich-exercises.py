#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour enrichir exercises-complete.json avec des variantes d'équipement
Génère automatiquement des variantes pour maximiser la diversité
"""

import json
import os

# Chemin du fichier
BASE_DIR = r'c:\Users\olive\Desktop\Version skaliprog\skaliprog.2.4Dev'
INPUT_FILE = os.path.join(BASE_DIR, 'data', 'exercises-complete.json')
OUTPUT_FILE = os.path.join(BASE_DIR, 'data', 'exercises-complete-enriched.json')

# Template de base pour les nouveaux exercices
def create_exercise_variant(base_name, variant_name, equipment, category_id, subcategory,
                            level, force_type, primary_muscles, difficulty_rank,
                            typology_tags, energy_system, secondary_muscles=None):
    """Crée une variante d'exercice"""
    slug = variant_name.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('+', '_')

    exercise = {
        "name": variant_name,
        "slug": slug,
        "category_id": category_id,
        "subcategory": subcategory,
        "level": level,
        "force_type": force_type,
        "mechanic": "compound",
        "primary_muscles": primary_muscles,
        "equipment_required": equipment,
        "difficulty_rank": difficulty_rank,
        "typology_tags": typology_tags,
        "energy_system": energy_system
    }

    if secondary_muscles:
        exercise["secondary_muscles"] = secondary_muscles

    # Vérifier si l'exercice peut se faire sans équipement
    if not equipment or equipment == []:
        exercise["can_do_without_equipment"] = True

    return exercise

def main():
    print("[*] Chargement du fichier actuel...")

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    exercises = data['exercises']
    current_count = sum(1 for ex in exercises if 'name' in ex)
    print(f"[OK] {current_count} exercices actuels charges")

    # ==========================================
    # CATÉGORIE 3: POWERLIFTING - Ajout variantes
    # ==========================================
    print("\n[+] Ajout des variantes POWERLIFTING...")

    new_powerlifting = [
        # Bench Press variants
        create_exercise_variant("Bench Press", "Paused Bench Press", ["barbell", "bench"], 3, "powerlifting",
                               "intermediate", "push", ["chest", "triceps"], 6, ["powerlifting", "strength"], "anaerobic_alactic", ["shoulders"]),
        create_exercise_variant("Bench Press", "Board Press", ["barbell", "bench", "boards"], 3, "powerlifting",
                               "advanced", "push", ["triceps", "chest"], 7, ["powerlifting", "strength"], "anaerobic_alactic"),
        create_exercise_variant("Bench Press", "Floor Press", ["barbell"], 3, "powerlifting",
                               "intermediate", "push", ["chest", "triceps"], 6, ["powerlifting", "strength"], "anaerobic_alactic"),
        create_exercise_variant("Bench Press", "Spoto Press", ["barbell", "bench"], 3, "powerlifting",
                               "advanced", "push", ["chest", "triceps"], 7, ["powerlifting", "strength"], "anaerobic_alactic"),

        # Squat variants
        create_exercise_variant("Squat", "Tempo Squat", ["barbell", "squat_rack"], 3, "powerlifting",
                               "intermediate", "push", ["quadriceps", "glutes"], 7, ["powerlifting", "strength"], "anaerobic_alactic"),
        create_exercise_variant("Squat", "Anderson Squat", ["barbell", "power_rack"], 3, "powerlifting",
                               "advanced", "push", ["quadriceps", "glutes"], 8, ["powerlifting", "strength"], "anaerobic_alactic"),
        create_exercise_variant("Squat", "Belt Squat", ["belt_squat_machine"], 3, "powerlifting",
                               "intermediate", "push", ["quadriceps", "glutes"], 6, ["powerlifting"], "anaerobic_alactic"),
        create_exercise_variant("Squat", "Safety Bar Squat", ["safety_squat_bar", "squat_rack"], 3, "powerlifting",
                               "intermediate", "push", ["quadriceps", "glutes"], 7, ["powerlifting"], "anaerobic_alactic"),

        # Deadlift variants
        create_exercise_variant("Deadlift", "Stiff-Leg Deadlift", ["barbell"], 3, "powerlifting",
                               "intermediate", "pull", ["hamstrings", "lower_back"], 7, ["powerlifting", "bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Deadlift", "Rack Pull (High)", ["barbell", "power_rack"], 3, "powerlifting",
                               "intermediate", "pull", ["back", "traps"], 7, ["powerlifting", "strength"], "anaerobic_alactic"),
        create_exercise_variant("Deadlift", "Rack Pull (Mid)", ["barbell", "power_rack"], 3, "powerlifting",
                               "intermediate", "pull", ["back", "glutes"], 7, ["powerlifting", "strength"], "anaerobic_alactic"),
        create_exercise_variant("Deadlift", "Rack Pull (Low)", ["barbell", "power_rack"], 3, "powerlifting",
                               "intermediate", "pull", ["back", "legs"], 8, ["powerlifting", "strength"], "anaerobic_alactic"),
        create_exercise_variant("Deadlift", "Trap Bar Deadlift", ["trap_bar"], 3, "powerlifting",
                               "intermediate", "pull", ["legs", "back"], 7, ["powerlifting", "strength"], "anaerobic_alactic"),
    ]

    # ==========================================
    # CATÉGORIE 5: PUSH - Variantes isolation
    # ==========================================
    print("[+] Ajout des variantes PUSH (isolation)...")

    new_push = [
        # Chest
        create_exercise_variant("Flyes", "Pec Deck Machine", ["pec_deck"], 5, "chest",
                               "beginner", "push", ["chest"], 3, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Press", "Landmine Press", ["barbell", "landmine"], 5, "chest",
                               "intermediate", "push", ["chest", "shoulders"], 6, ["bodybuilding", "functional"], "anaerobic_alactic"),
        create_exercise_variant("Press", "Svend Press", ["plates"], 5, "chest",
                               "beginner", "push", ["chest"], 4, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Flyes", "Cable Crossover High", ["cable_machine"], 5, "chest",
                               "beginner", "push", ["lower_chest"], 4, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Flyes", "Cable Crossover Mid", ["cable_machine"], 5, "chest",
                               "beginner", "push", ["mid_chest"], 4, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Flyes", "Cable Crossover Low", ["cable_machine"], 5, "chest",
                               "beginner", "push", ["upper_chest"], 4, ["bodybuilding"], "anaerobic_alactic"),

        # Shoulders
        create_exercise_variant("Raises", "Lu Raises", ["dumbbells"], 5, "shoulders",
                               "beginner", "push", ["front_delts"], 3, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Raises", "Y-Raises", ["dumbbells"], 5, "shoulders",
                               "beginner", "pull", ["rear_delts", "traps"], 4, ["bodybuilding", "mobility"], "anaerobic_alactic"),
        create_exercise_variant("Raises", "W-Raises", ["dumbbells"], 5, "shoulders",
                               "beginner", "pull", ["rear_delts"], 4, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Pull-Apart", "Band Pull-Apart", ["resistance_band"], 5, "shoulders",
                               "beginner", "pull", ["rear_delts", "upper_back"], 2, ["mobility", "bodybuilding"], "aerobic"),

        # Triceps
        create_exercise_variant("Extensions", "JM Press", ["barbell", "bench"], 5, "triceps",
                               "advanced", "push", ["triceps"], 7, ["powerlifting", "bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Extensions", "Tate Press", ["dumbbells", "bench"], 5, "triceps",
                               "intermediate", "push", ["triceps"], 6, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Extensions", "French Press", ["ez_bar", "bench"], 5, "triceps",
                               "intermediate", "push", ["triceps"], 5, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Extensions", "Rope Triceps Extension", ["cable_machine"], 5, "triceps",
                               "beginner", "push", ["triceps"], 3, ["bodybuilding"], "anaerobic_alactic"),
    ]

    # ==========================================
    # CATÉGORIE 6: PULL - Variantes dos & bras
    # ==========================================
    print("[+] Ajout des variantes PULL...")

    new_pull = [
        # Back rows
        create_exercise_variant("Row", "Meadows Row", ["barbell", "landmine"], 6, "back",
                               "intermediate", "pull", ["lats", "mid_back"], 7, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Row", "Yates Row", ["barbell"], 6, "back",
                               "intermediate", "pull", ["lats", "traps"], 7, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Row", "Seal Row", ["bench", "barbell"], 6, "back",
                               "intermediate", "pull", ["mid_back"], 6, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Row", "Inverted Row", ["barbell", "rack"], 6, "back",
                               "beginner", "pull", ["lats", "mid_back"], 5, ["bodybuilding", "calisthenics"], "anaerobic_alactic"),

        # Lats
        create_exercise_variant("Pulldown", "Straight Arm Pulldown", ["cable_machine"], 6, "back",
                               "beginner", "pull", ["lats"], 4, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Pullover", "Dumbbell Pullover", ["dumbbell", "bench"], 6, "back",
                               "beginner", "pull", ["lats", "chest"], 5, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Pullover", "Cable Pullover", ["cable_machine"], 6, "back",
                               "beginner", "pull", ["lats"], 4, ["bodybuilding"], "anaerobic_alactic"),

        # Biceps variants
        create_exercise_variant("Curl", "Concentration Curl", ["dumbbell"], 6, "biceps",
                               "beginner", "pull", ["biceps"], 4, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Curl", "Spider Curl", ["ez_bar", "preacher_bench"], 6, "biceps",
                               "beginner", "pull", ["biceps"], 5, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Curl", "Incline Dumbbell Curl", ["dumbbells", "incline_bench"], 6, "biceps",
                               "beginner", "pull", ["biceps"], 4, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Curl", "Zottman Curl", ["dumbbells"], 6, "biceps",
                               "intermediate", "pull", ["biceps", "forearms"], 5, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Curl", "21s Curl", ["barbell"], 6, "biceps",
                               "intermediate", "pull", ["biceps"], 6, ["bodybuilding"], "anaerobic_lactic"),
        create_exercise_variant("Curl", "Drag Curl", ["barbell"], 6, "biceps",
                               "intermediate", "pull", ["biceps"], 5, ["bodybuilding"], "anaerobic_alactic"),
    ]

    # ==========================================
    # CATÉGORIE 7: LEGS - Variantes massives
    # ==========================================
    print("[+] Ajout des variantes LEGS...")

    new_legs = [
        # Squats
        create_exercise_variant("Squat", "Hack Squat", ["hack_squat_machine"], 7, "legs",
                               "intermediate", "push", ["quadriceps"], 6, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Squat", "Sissy Squat", [], 7, "legs",
                               "advanced", "push", ["quadriceps"], 8, ["bodybuilding", "gym_skills"], "anaerobic_alactic"),
        create_exercise_variant("Squat", "Zercher Squat", ["barbell"], 7, "legs",
                               "advanced", "push", ["quadriceps", "core"], 8, ["powerlifting", "strongman"], "anaerobic_alactic"),
        create_exercise_variant("Squat", "Landmine Squat", ["barbell", "landmine"], 7, "legs",
                               "beginner", "push", ["quadriceps", "glutes"], 5, ["functional"], "anaerobic_alactic"),

        # Single leg
        create_exercise_variant("Leg Press", "Single Leg Press", ["leg_press_machine"], 7, "legs",
                               "intermediate", "push", ["quadriceps", "glutes"], 6, ["bodybuilding"], "anaerobic_alactic"),

        # Step-Ups VARIANTES MASSIVES
        create_exercise_variant("Step-Up", "Step-Up Bodyweight", ["box"], 7, "legs",
                               "beginner", "push", ["quadriceps", "glutes"], 4, ["metcon", "tactical"], "anaerobic_lactic"),
        create_exercise_variant("Step-Up", "Step-Up Dumbbell", ["box", "dumbbells"], 7, "legs",
                               "beginner", "push", ["quadriceps", "glutes"], 5, ["bodybuilding", "metcon"], "anaerobic_lactic"),
        create_exercise_variant("Step-Up", "Step-Up Barbell", ["box", "barbell"], 7, "legs",
                               "intermediate", "push", ["quadriceps", "glutes"], 6, ["strength"], "anaerobic_lactic"),
        create_exercise_variant("Step-Up", "Step-Up Kettlebell", ["box", "kettlebell"], 7, "legs",
                               "beginner", "push", ["quadriceps", "glutes"], 5, ["functional"], "anaerobic_lactic"),
        create_exercise_variant("Step-Up", "Step-Up Sandbag", ["box", "sandbag"], 7, "legs",
                               "intermediate", "push", ["quadriceps", "glutes"], 6, ["tactical"], "anaerobic_lactic"),
        create_exercise_variant("Step-Up", "Step-Up Wall Ball", ["box", "wall_ball"], 7, "legs",
                               "beginner", "push", ["quadriceps", "glutes", "shoulders"], 5, ["metcon"], "anaerobic_lactic"),
        create_exercise_variant("Step-Up", "Lateral Step-Up", ["box"], 7, "legs",
                               "beginner", "push", ["quadriceps", "glutes", "adductors"], 5, ["functional"], "anaerobic_lactic"),
        create_exercise_variant("Step-Up", "Lateral Step-Up Dumbbell", ["box", "dumbbells"], 7, "legs",
                               "intermediate", "push", ["quadriceps", "glutes", "adductors"], 6, ["bodybuilding"], "anaerobic_lactic"),

        # Lunges VARIANTES MASSIVES
        create_exercise_variant("Lunges", "Walking Lunges Dumbbell", ["dumbbells"], 7, "legs",
                               "beginner", "push", ["quadriceps", "glutes"], 5, ["metcon", "bodybuilding"], "anaerobic_lactic"),
        create_exercise_variant("Lunges", "Walking Lunges Barbell", ["barbell"], 7, "legs",
                               "intermediate", "push", ["quadriceps", "glutes"], 7, ["strength"], "anaerobic_lactic"),
        create_exercise_variant("Lunges", "Walking Lunges Kettlebell", ["kettlebells"], 7, "legs",
                               "beginner", "push", ["quadriceps", "glutes"], 5, ["functional"], "anaerobic_lactic"),
        create_exercise_variant("Lunges", "Walking Lunges Sandbag", ["sandbag"], 7, "legs",
                               "intermediate", "push", ["quadriceps", "glutes"], 6, ["tactical"], "anaerobic_lactic"),
        create_exercise_variant("Lunges", "Walking Lunges Overhead Barbell", ["barbell"], 7, "legs",
                               "advanced", "push", ["quadriceps", "glutes", "shoulders"], 8, ["weightlifting", "mobility"], "anaerobic_lactic"),
        create_exercise_variant("Lunges", "Reverse Lunges Dumbbell", ["dumbbells"], 7, "legs",
                               "beginner", "push", ["quadriceps", "glutes"], 5, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Lunges", "Reverse Lunges Barbell", ["barbell"], 7, "legs",
                               "intermediate", "push", ["quadriceps", "glutes"], 6, ["strength"], "anaerobic_alactic"),
        create_exercise_variant("Lunges", "Lateral Lunges Dumbbell", ["dumbbells"], 7, "legs",
                               "beginner", "push", ["quadriceps", "adductors"], 5, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Lunges", "Curtsy Lunge", ["dumbbells"], 7, "legs",
                               "beginner", "push", ["glutes", "quadriceps"], 5, ["bodybuilding"], "anaerobic_alactic"),

        # Hamstrings
        create_exercise_variant("Leg Curl", "Seated Leg Curl", ["leg_curl_machine"], 7, "legs",
                               "beginner", "pull", ["hamstrings"], 3, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Leg Curl", "Standing Leg Curl", ["leg_curl_machine"], 7, "legs",
                               "beginner", "pull", ["hamstrings"], 3, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Hip Extension", "GHD Hip Extension", ["ghd_machine"], 7, "legs",
                               "intermediate", "pull", ["glutes", "hamstrings"], 6, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Hip Extension", "Back Extension (Hyper)", ["hyperextension_bench"], 7, "legs",
                               "beginner", "pull", ["lower_back", "glutes"], 4, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Hip Extension", "Reverse Hyperextension", ["reverse_hyper_machine"], 7, "legs",
                               "intermediate", "pull", ["glutes", "hamstrings"], 6, ["bodybuilding", "powerlifting"], "anaerobic_alactic"),

        # Adductors/Abductors
        create_exercise_variant("Adductors", "Adductor Machine", ["adductor_machine"], 7, "legs",
                               "beginner", "push", ["adductors"], 3, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Abductors", "Abductor Machine", ["abductor_machine"], 7, "legs",
                               "beginner", "push", ["abductors", "glutes"], 3, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Adductors", "Copenhagen Plank", [], 7, "legs",
                               "advanced", "static", ["adductors", "core"], 7, ["gym_skills"], "anaerobic_alactic"),

        # Calves
        create_exercise_variant("Calf Raise", "Single Leg Calf Raise", [], 7, "legs",
                               "beginner", "push", ["calves"], 3, ["bodybuilding"], "anaerobic_alactic"),
        create_exercise_variant("Calf Raise", "Donkey Calf Raise", ["calf_raise_machine"], 7, "legs",
                               "intermediate", "push", ["calves"], 4, ["bodybuilding"], "anaerobic_alactic"),
    ]

    print(f"   Ajouté: {len(new_powerlifting)} powerlifting, {len(new_push)} push, {len(new_pull)} pull, {len(new_legs)} legs")

    # Ajouter tous les nouveaux exercices
    # Trouver l'index où insérer (après chaque catégorie)
    for idx, ex in enumerate(exercises):
        if 'comment' in ex and 'POWERLIFTING' in ex.get('category_name', ''):
            # Insérer après la catégorie powerlifting existante
            insert_idx = idx
            for i in range(idx+1, len(exercises)):
                if 'comment' in exercises[i] and 'category_name' in exercises[i]:
                    insert_idx = i
                    break
            # Insérer avant la prochaine catégorie
            for new_ex in reversed(new_powerlifting):
                exercises.insert(insert_idx, new_ex)
            break

    for idx, ex in enumerate(exercises):
        if 'comment' in ex and 'PUSH' in ex.get('category_name', ''):
            insert_idx = idx
            for i in range(idx+1, len(exercises)):
                if 'comment' in exercises[i] and 'category_name' in exercises[i]:
                    insert_idx = i
                    break
            for new_ex in reversed(new_push):
                exercises.insert(insert_idx, new_ex)
            break

    for idx, ex in enumerate(exercises):
        if 'comment' in ex and 'PULL' in ex.get('category_name', ''):
            insert_idx = idx
            for i in range(idx+1, len(exercises)):
                if 'comment' in exercises[i] and 'category_name' in exercises[i]:
                    insert_idx = i
                    break
            for new_ex in reversed(new_pull):
                exercises.insert(insert_idx, new_ex)
            break

    for idx, ex in enumerate(exercises):
        if 'comment' in ex and 'LEGS' in ex.get('category_name', ''):
            insert_idx = idx
            for i in range(idx+1, len(exercises)):
                if 'comment' in exercises[i] and 'category_name' in exercises[i]:
                    insert_idx = i
                    break
            for new_ex in reversed(new_legs):
                exercises.insert(insert_idx, new_ex)
            break

    # Mettre à jour le compte
    new_count = sum(1 for ex in exercises if 'name' in ex)
    data['total_exercises'] = new_count
    data['exercises'] = exercises

    # Sauvegarder
    print(f"\n[*] Sauvegarde du fichier enrichi...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] TERMINE!")
    print(f"   Exercices avant: {current_count}")
    print(f"   Exercices apres: {new_count}")
    print(f"   Nouveaux: +{new_count - current_count}")
    print(f"\n[*] Fichier sauvegarde: {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
