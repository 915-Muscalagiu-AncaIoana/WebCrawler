import sqlalchemy.exc
from flask import Flask
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, create_engine
from flask_cors import CORS
import os

from sqlalchemy.sql.ddl import CreateSchema

metadata = MetaData()
app = Flask(__name__)
database_uri = os.environ.get('DATABASE_URL')
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:123456789@localhost:5432/webcrawler'
app.config['SQLALCHEMY_DATABASE_URI'] = database_uri

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# engine = create_engine('postgresql://postgres:123456789@localhost:5432/webcrawler')
engine = create_engine(database_uri)
db = SQLAlchemy(app)
schema_name = 'my_schema'
try:
    engine.execute(CreateSchema(schema_name))
except sqlalchemy.exc.ProgrammingError:
    pass
CORS(app, resources={r"*": {"origins": "*"}})
ma = Marshmallow()
