import spacy
from spacy.matcher import Matcher

nlp = spacy.load("en_core_web_md")

# Example patterns for features and care tips
feature_patterns = [
    [{"LOWER": {"IN": ["fragrant", "colorful", "large", "compact", "rare", "award", "winner"]}}],
    [{"LOWER": "flower"}],
    [{"LOWER": "petal"}],
]
care_patterns = [
    [{"LOWER": {"IN": ["water", "watering", "light", "shade", "humidity", "temperature", "fertilizer", "feed"]}}],
    [{"LOWER": "care"}],
]

feature_matcher = Matcher(nlp.vocab)
feature_matcher.add("FEATURE", feature_patterns)
care_matcher = Matcher(nlp.vocab)
care_matcher.add("CARE", care_patterns)

def extract_entities(text):
    doc = nlp(text)
    entities = [f"{ent.text} ({ent.label_})" for ent in doc.ents]
    # Add custom feature/care extraction
    features = [doc[start:end].text for match_id, start, end in feature_matcher(doc)]
    care_tips = [doc[start:end].text for match_id, start, end in care_matcher(doc)]
    if features:
        entities.append(f"Features: {features}")
    if care_tips:
        entities.append(f"CareTips: {care_tips}")
    return entities

def generate_spacy_description(product_name, context=None):
    doc = nlp(product_name + " " + (context or ""))
    entities = extract_entities(product_name + " " + (context or ""))
    description = (
        f"The {product_name} is a truly remarkable orchid. "
        f"{context or 'It is known for its unique beauty and elegance, making it a favorite among collectors.'} "
        f"With proper care, it will reward you with stunning blooms and a captivating presence in any collection."
    )
    if entities:
        description += f" (Recognized entities: {entities})"
    return description, entities 