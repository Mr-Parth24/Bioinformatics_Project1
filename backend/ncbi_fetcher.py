from Bio import Entrez, SeqIO

# Fetching the sequence by accession number
def fetch_sequence_by_accession(accession: str) -> tuple[str, str]:

    # ncbi needs an email to use their database.
    Entrez.email = "dr.random24@gmail.com" 
    
    try:
        # Ask for the sequence from the NCBI database
        handle = Entrez.efetch(db="protein", id=accession, rettype="fasta", retmode="text")
        record = SeqIO.read(handle, "fasta")
        handle.close() 
        
        # Package the answers
        sequence = str(record.seq)
        ncbi_link = f"https://www.ncbi.nlm.nih.gov/protein/{accession}"
        
        return sequence, ncbi_link
        
    except Exception:
        raise Exception(
            "Analysis failed because you entered the wrong accession number. "
            "Check the ID on NCBI and try again."
        )

# Fetching the Genbank record by accession number
def fetch_genbank_record(accession: str) -> str:
    Entrez.email = "dr.random24@gmail.com" 
    
    try:
        handle = Entrez.efetch(db="protein", id=accession, rettype="gb", retmode="text")
        record_text = handle.read()
        handle.close()
        return record_text
        
    except Exception:
        raise Exception(
            "Analysis failed because you entered the wrong accession number. "
            "Check the ID on NCBI and try again."
        )
