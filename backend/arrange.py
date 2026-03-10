from typing import List, Dict, Any
import random

def get_camelot_number(key: str) -> int:
    try:
        return int(key[:-1])
    except ValueError:
        return 0

def get_camelot_letter(key: str) -> str:
    return key[-1].upper() if key else ""

def is_compatible(key1: str, key2: str) -> bool:
    if not key1 or not key2:
        return False
        
    num1, let1 = get_camelot_number(key1), get_camelot_letter(key1)
    num2, let2 = get_camelot_number(key2), get_camelot_letter(key2)
    
    # Perfect match
    if num1 == num2 and let1 == let2:
        return True
    
    # Relative major/minor (A <-> B)
    if num1 == num2 and let1 != let2:
        return True
        
    # Adjacent number (+1 or -1)
    if let1 == let2:
        if (num1 % 12) + 1 == num2 or (num2 % 12) + 1 == num1:
            return True
            
    return False

def determine_transition(current_track: Dict, next_track: Dict) -> str:
    key1 = current_track.get('camelot_key')
    key2 = next_track.get('camelot_key')
    bpm1 = current_track.get('bpm', 0)
    bpm2 = next_track.get('bpm', 0)
    
    if key1 == key2:
        return "perfect"
    elif is_compatible(key1, key2):
        if abs(bpm2 - bpm1) <= 5:
            return "smooth"
    
    if bpm2 - bpm1 >= 3:
        return "ramp"
        
    return "smooth"

def arrange_tracks(tracks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not tracks:
        return []
        
    # Start with the lowest BPM track
    unplayed_pool = sorted(tracks, key=lambda x: float(x.get('bpm', 0)))
    arranged_set = [unplayed_pool.pop(0)]
    arranged_set[0]['transition_label'] = None
    
    while unplayed_pool:
        current_track = arranged_set[-1]
        best_candidate_idx = -1
        lowest_penalty = float('inf')
        best_label = "WILD CARD"
        
        current_bpm = float(current_track.get('bpm', 0))
        current_key = str(current_track.get('camelot_key') or "")
        
        for i, candidate in enumerate(unplayed_pool):
            candidate_bpm = float(candidate.get('bpm', 0))
            candidate_key = str(candidate.get('camelot_key') or "")
            bpm_diff = abs(current_bpm - candidate_bpm)
            
            # 6% BPM variance rule (ignore if difference is > 6% of current BPM, unless no tracks fit)
            max_bpm_diff = current_bpm * 0.06
            
            is_comp = False
            if current_key and candidate_key:
                is_comp = is_compatible(current_key, candidate_key)
            else:
                is_comp = True # Handle missing keys gracefully
                
            penalty = bpm_diff
            label = "WILD CARD"
            
            num1, let1 = get_camelot_number(current_key), get_camelot_letter(current_key)
            num2, let2 = get_camelot_number(candidate_key), get_camelot_letter(candidate_key)
            
            if bpm_diff == 0 and current_key == candidate_key and current_key:
                label = "SEAMLESS BLEND"
                penalty -= 50
            elif num1 == num2 and let1 != let2 and current_key and candidate_key:
                label = "MOOD SHIFT"
                penalty -= 40
            elif let1 == let2 and (((num1 % 12) + 1 == num2) or ((num2 % 12) + 1 == num1)) and current_key and candidate_key:
                label = "HARMONIC STEP"
                penalty -= 30
            elif is_comp and 1 <= (candidate_bpm - current_bpm) <= 2:
                label = "ENERGY BUILDUP"
                penalty -= 20
            elif is_comp and candidate_bpm < current_bpm:
                label = "VIBE BREATHER"
                penalty += 5
            elif is_comp and 3 <= bpm_diff <= 6:
                label = "TEMPO RIDE"
                penalty += 10
            elif bpm_diff == 0 and not is_comp:
                label = "RHYTHM BRIDGE"
                penalty += 20
            elif is_comp:
                label = "SMOOTH GROOVE"
                penalty -= 10
            else:
                label = "WILD CARD"
                penalty += 1000
            
            # Energy Flow Penalty
            if candidate_bpm < current_bpm:
                penalty += 15
                
            if penalty < lowest_penalty:
                lowest_penalty = penalty
                best_candidate_idx = i
                best_label = label
                
        # Selection
        next_track = unplayed_pool.pop(best_candidate_idx)
        
        # Anti-repetition: if this label is the same as the previous one, pick a fallback
        prev_label = arranged_set[-1].get('transition_label') if len(arranged_set) > 0 else None
        if best_label == prev_label and prev_label is not None:
            alternates = [
                label for label in ["HARMONIC FLOW", "RHYTHM BRIDGE", "STEADY GROOVE", "TEMPO RIDE", "SMOOTH GROOVE"]
                if label != best_label
            ]
            best_label = random.choice(alternates)
        
        next_track['transition_label'] = best_label
        arranged_set.append(next_track)
        
    return arranged_set
