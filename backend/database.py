from flask_sqlalchemy import SQLAlchemy
from open_alchemy import init_yaml
import os

db = SQLAlchemy()

SPEC_DIR = os.path.dirname(__file__)
SPEC_FILE = os.path.join(SPEC_DIR, "quizapi.yaml")
MODELS_FILENAME = os.path.join(SPEC_DIR, "models.py")

# Generiše SQLAlchemy modele (Quiz, Question, Result, Category) na osnovu
# šema definisanih u quizapi.yaml
init_yaml(SPEC_FILE, base=db.Model, models_filename=MODELS_FILENAME)
