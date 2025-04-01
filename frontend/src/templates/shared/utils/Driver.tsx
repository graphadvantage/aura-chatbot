/* eslint-disable no-console */
import neo4j, { Driver } from 'neo4j-driver';

export let driver: Driver;

export async function setDriver(connectionURI: string, username: string, password: string) {
  try {
    driver = neo4j.driver(connectionURI, neo4j.auth.basic(username, password));
    await driver.getServerInfo();
    localStorage.setItem(
      'needleStarterKit-neo4j.connection',
      JSON.stringify({ uri: connectionURI, user: username, password: password })
    );
    return true;
  } catch (err) {
    console.error(`Connection error\n${err}\nCause: ${err as Error}`);
    return false;
  }
}

export async function disconnect() {
  try {
    await driver.close();
    return true;
  } catch (err) {
    console.error(`Disconnection error\n${err}\nCause: ${err as Error}`);
    return false;
  }
}

/*
  Everything below this line is only for providing examples based on datasets available in Neo4j Sandbox (sandbox.neo4j.com).
  When using this code in your own project, you should remove the examples below and use your own queries.
*/
export async function runRecoQuery(query: string) {
  const reco = [];
  try {
    let { records } = await driver.executeQuery(query);
    for (let record of records) {
      reco.push({
        id: record.get('id'),
        genres: record.get('genres'),
        year: record.get('year'),
        imdbRating: record.get('imdbRating'),
        languages: record.get('languages'),
        title: record.get('title'),
        plot: record.get('plot'),
        poster: record.get('poster'),
      });
    }

    return reco;
  } catch (err) {
    console.error(`Disconnection error\n${err}\nCause: ${err as Error}`);
    return false;
  }
}

export async function runQuery(query: string) {
  const nodes = [];
  const rels = [];
  try {
    let { records } = await driver.executeQuery(query);
    console.log(records);
    for (let record of records) {
      const nodeStart = record.get('a');
      nodes.push({
        id: nodeStart.identity.low,
        labels: nodeStart.labels,
        properties: nodeStart.properties,
      });
      const nodeEnd = record.get('b');
      nodes.push({
        id: nodeEnd.identity.low,
        labels: nodeEnd.labels,
        properties: nodeEnd.properties,
      });
      const nodeDoc = record.get('d');
      nodes.push({
        id: nodeDoc.identity.low,
        labels: nodeDoc.labels,
        properties: nodeDoc.properties,
      });
      const rel = record.get('r');
      rels.push({
        id: rel.elementId,
        start: rel.start.low,
        end: rel.end.low,
        type: rel.type,
        properties: rel.properties,
      });
      const rel2 = record.get('r2');
      rels.push({
        id: rel2.elementId,
        start: rel2.start.low,
        end: rel2.end.low,
        type: rel2.type,
        properties: rel2.properties,
      });
    }
    console.log(rels);
    return { nodes: nodes, rels: rels };
  } catch (err) {
    console.error(`Query error\n${err}\nCause: ${err as Error}`);
    return [];
  }
}
