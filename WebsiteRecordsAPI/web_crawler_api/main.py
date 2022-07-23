from flask import request, jsonify

from web_crawler_api import app, db
from web_crawler_api.controller import Controller
from ariadne import load_schema_from_path, make_executable_schema, \
    graphql_sync, snake_case_fallback_resolvers, ObjectType
from ariadne.constants import PLAYGROUND_HTML
from web_crawler_api.queries import resolve_websites, resolve_nodes

db.create_all()
query = ObjectType("Query")
query.set_field("websites", resolve_websites)
query.set_field("nodes",resolve_nodes)
type_defs = load_schema_from_path("schema.graphql")
schema = make_executable_schema(
    type_defs, query, snake_case_fallback_resolvers
)

@app.route("/graphql", methods=["GET"])
def graphql_playground():
    return PLAYGROUND_HTML, 200

@app.route("/graphql", methods=["POST"])
def graphql_server():
    data = request.get_json()

    success, result = graphql_sync(
        schema,
        data,
        context_value=request,
        debug=app.debug
    )

    status_code = 200 if success else 400
    return jsonify(result), status_code


controller = Controller()
if __name__ == '__main__':
    app.run()
