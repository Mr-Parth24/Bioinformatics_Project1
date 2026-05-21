import re

# Default pattern
# Allowed amino acids : A, V, L, I, M, P, F, Y, W, S, T, N, C, H, Q, G
# Invalid: R, D, E, K 
# Pattern: AL???LW

DEFAULT_PATTERN_STR = r'AL[AVILMPFYWSTNCQHG]{3}LW'

def find_pattern_in_regions(sequence: str, regions: list[tuple[int, int]], pattern_str: str = DEFAULT_PATTERN_STR):
    """
    Looks for the specific pattern but only inside the areas that passed the threshold
    then will highlight it red.
    """
    matches = []
    
    try:
        regex = re.compile(pattern_str)
    except re.error:
        # Fallback to default if the pattern is invalid from the user
        regex = re.compile(DEFAULT_PATTERN_STR)
    
    for start, end in regions:
        region_seq = sequence[start:end]
        
        # Go through and find all matches in this specific chunk
        for match in regex.finditer(region_seq):
            
            # Figure out where this match sits in the entire sequence
            global_start = start + match.start()
            global_end = start + match.end()
            
            # Save match info so we can send it back to the frontend
            match_data = {
                "start": global_start,
                "end": global_end - 1, 
                "sequence": match.group()
            }
            if match_data not in matches:
                matches.append(match_data)
                
    return matches
