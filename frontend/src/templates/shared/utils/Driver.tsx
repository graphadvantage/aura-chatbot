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

export async function runQuery(query: string) {
  const nodes = [];
  const rels = [];
  try {
    let { records } = await driver.executeQuery(query);
    //console.log(records);
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

      const rel = record.get('r');
      rels.push({
        id: rel.elementId,
        start: rel.start.low,
        end: rel.end.low,
        type: rel.type,
        properties: rel.properties,
      });

    }
    //console.log(rels);
    return { nodes: nodes, rels: rels };
  } catch (err) {
    console.error(`Query error\n${err}\nCause: ${err as Error}`);
    return [];
  }
}
