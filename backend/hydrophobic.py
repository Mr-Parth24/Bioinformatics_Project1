KYTE_DOOLITTLE = {
    'A': 1.8, 'R': -4.5, 'N': -3.5, 'D': -3.5, 'C': 2.5,
    'Q': -3.5, 'E': -3.5, 'G': -0.4, 'H': -3.2, 'I': 4.5,
    'L': 3.8, 'K': -3.9, 'M': 1.9, 'F': 2.8, 'P': -1.6,
    'S': -0.8, 'T': -0.7, 'W': -0.9, 'Y': -1.3, 'V': 4.2
}

def calculate_sliding_window(sequence: str, window_size: int = 19, threshold: float = 1.6):
    """
    This function does the math for the Kyte-Doolittle hydropathy plot.
    It takes a protein sequence, chops it into chunks and gives each chunk an average score.
    It returns the scores for the graph, and a list of areas that score higher than our threshold
    """
    
    # Check if the sequence is long enough
    seq_len = len(sequence)
    if seq_len < window_size:
        return [], [] # If the sequence is too short return empty lists

    # Initialize the window scores and high hydrophobicity regions
    window_scores = []
    high_hydrophobicity_regions = []

    for i in range(seq_len - window_size + 1):
        window_seq = sequence[i:i + window_size]
        
        # Check if the window contains valid amino acids
        # Calculate the average score for this window
        valid_amino = [aa for aa in window_seq if aa in KYTE_DOOLITTLE]
        if not valid_amino:
            avg_score = 0
        else:
            total_score = sum(KYTE_DOOLITTLE[aa] for aa in valid_amino)
            avg_score = total_score / len(valid_amino)
        
        # Adding the window score to the list
        position = i + 1 
        window_scores.append({  
            "position": position, 
            "score": round(avg_score, 3) # Average score of the window
        })

        # Save this region if it passes the threshold test
        if avg_score >= threshold: 
            high_hydrophobicity_regions.append((i, i + window_size))

    # Combine areas that overlap so we don't scan them twice later
    merged_regions = []
    if high_hydrophobicity_regions:
        current_start, current_end = high_hydrophobicity_regions[0] 
        for start, end in high_hydrophobicity_regions[1:]:
            if start <= current_end:
                current_end = max(current_end, end)
            else:
                merged_regions.append((current_start, current_end))
                current_start, current_end = start, end
        merged_regions.append((current_start, current_end))

    return window_scores, merged_regions
