from typing import List, Dict, Tuple
from config.settings import settings
from llama_index.core import (
    VectorStoreIndex,
    StorageContext,
    Document as LlamaDocument,
)
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.graph_stores.neo4j import Neo4jGraphStore
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.retrievers import VectorIndexRetriever
import qdrant_client
from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer
import spacy


class KnowledgeService:
    def __init__(self):
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except Exception:
            self.nlp = None
        
        # Qdrant Cloud uses a full HTTPS URL + API key; local uses host:port
        if settings.IS_QDRANT_CLOUD:
            self.qdrant_client = qdrant_client.QdrantClient(
                url=settings.QDRANT_HOST,
                api_key=settings.QDRANT_API_KEY,
            )
        else:
            self.qdrant_client = qdrant_client.QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
            )
        self.neo4j_driver = GraphDatabase.driver(
            settings.NEO4J_URI, auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        self.vector_store = QdrantVectorStore(client=self.qdrant_client, collection_name="knowledge_chunks")
        self.graph_store = Neo4jGraphStore(
            username=settings.NEO4J_USER,
            password=settings.NEO4J_PASSWORD,
            url=settings.NEO4J_URI,
        )
        
        self.storage_context = StorageContext.from_defaults(
            vector_store=self.vector_store,
            graph_store=self.graph_store
        )
        
        try:
            self.vector_index = VectorStoreIndex.from_vector_store(
                vector_store=self.vector_store,
                storage_context=self.storage_context
            )
        except Exception:
            self.vector_index = None

    def extract_entities_and_relations(self, text: str) -> Tuple[List[Dict], List[Dict]]:
        entities = []
        relations = []
        if not self.nlp or not text:
            return entities, relations
        
        doc = self.nlp(text)
        for ent in doc.ents:
            entities.append({
                "text": ent.text,
                "label": ent.label_,
                "start_char": ent.start_char,
                "end_char": ent.end_char
            })
        
        return entities, relations

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        return self.embedding_model.encode(texts).tolist()

    def process_document(self, text: str, document_id: int, metadata: Dict):
        if not text:
            return {"status": "no_text"}
        
        entities, relations = self.extract_entities_and_relations(text)
        
        splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
        chunks = splitter.split_text(text)
        
        llama_docs = [
            LlamaDocument(text=chunk, metadata={"document_id": document_id, "chunk_idx": i, **metadata}) 
            for i, chunk in enumerate(chunks)
        ]
        
        storage_context = StorageContext.from_defaults(
            vector_store=self.vector_store,
            graph_store=self.graph_store
        )
        
        index = VectorStoreIndex.from_documents(
            llama_docs, storage_context=storage_context)
        
        self.vector_index = index
        
        self._store_entities_in_neo4j(document_id, entities, relations)
        
        return {
            "status": "success", "num_chunks": len(chunks), "num_entities": len(entities)
        }

    def _store_entities_in_neo4j(self, document_id: int, entities: List[Dict], relations: List[Dict]):
        with self.neo4j_driver.session() as session:
            for entity in entities:
                session.run(
                    """
                    MERGE (e:Entity {text: $text, label: $label})
                    MERGE (d:Document {id: $document_id})
                    MERGE (d)-[:MENTIONS]->(e)
                    """,
                    text=entity["text"],
                    label=entity["label"],
                    document_id=document_id
                )

    def semantic_search(self, query: str, top_k: int = 5) -> List[Dict]:
        if not self.vector_index:
            return []
        
        retriever = VectorIndexRetriever(
            index=self.vector_index,
            similarity_top_k=top_k
        )
        nodes = retriever.retrieve(query)
        
        results = []
        for node in nodes:
            results.append({
                "text": node.text,
                "score": node.score,
                "metadata": node.metadata
            })
        return results

    def graph_retrieval(self, query: str, top_k: int = 5) -> List[Dict]:
        entities = []
        if self.nlp:
            doc = self.nlp(query)
            for ent in doc.ents:
                entities.append(ent.text)
        
        results = []
        if entities:
            with self.neo4j_driver.session() as session:
                result = session.run(
                    """
                    MATCH (e:Entity)<-[:MENTIONS]-(d:Document)
                    WHERE e.text IN $entities
                    RETURN d.id AS document_id, collect(e.text) AS related_entities
                    LIMIT $top_k
                    """,
                    entities=entities,
                    top_k=top_k
                )
                for record in result:
                    results.append({
                        "document_id": record["document_id"],
                        "related_entities": record["related_entities"]
                    })
        return results

    def combined_query(self, query: str, top_k: int = 5) -> Dict:
        vector_results = self.semantic_search(query, top_k)
        graph_results = self.graph_retrieval(query, top_k)
        
        return {
            "vector_results": vector_results,
            "graph_results": graph_results
        }

    def close(self):
        self.neo4j_driver.close()


knowledge_service = KnowledgeService()
