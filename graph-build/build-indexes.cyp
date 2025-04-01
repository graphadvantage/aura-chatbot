CREATE VECTOR INDEX chunk_embedding
FOR (n:Chunk) ON (n.embedding)
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}};

CREATE FULLTEXT INDEX entity_text FOR (n:Entity) ON EACH [n.text]
OPTIONS {
  indexConfig: {
    `fulltext.analyzer`: 'english',
    `fulltext.eventually_consistent`: true
  }
}
