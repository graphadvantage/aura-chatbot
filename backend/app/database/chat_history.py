from neo4j_graphrag.message_history import Neo4jMessageHistory

class MessageHistory:
    # no singleton used as there may be mulitple session id's.

    def __init__(self, driver, window = 40):
        self._driver = driver
        self._window = window

    def create_history(self, session_id = None):
        history = Neo4jMessageHistory(
            session_id=session_id,
            driver=self._driver,
            window=self._window
        )
    
        return history, self._driver, session_id