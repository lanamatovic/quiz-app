import os
import connexion
from flask_cors import CORS
import database

app = connexion.FlaskApp(__name__, specification_dir=".")
app.app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
app.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Inicijalizacija baze podataka
database.db.init_app(app.app)
with app.app.app_context():
    database.db.create_all()
    print("Database tables created!")

# Omogući CORS za komunikaciju sa React-om
CORS(app.app)

# Registruje rute na osnovu OpenAPI specifikacije i validira zahteve prema njoj
app.add_api("quizapi.yaml", arguments={"title": "QuizAPI"}, strict_validation=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
