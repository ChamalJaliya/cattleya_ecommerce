import os
from openai import OpenAI
from .prompt_templates import ELABORATIVE_PRODUCT_PROMPT

def generate_elaborative_description(product_name, context=None):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise Exception("No OpenAI API key set")
    
    client = OpenAI(api_key=api_key)
    prompt = ELABORATIVE_PRODUCT_PROMPT.format(
        product_name=product_name,
        context=context or "This is for a premium orchid e-commerce site."
    )
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a creative orchid expert and copywriter."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=200,
        temperature=0.85,
    )
    return completion.choices[0].message.content.strip() 