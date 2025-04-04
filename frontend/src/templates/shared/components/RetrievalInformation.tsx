/* eslint-disable no-confusing-arrow */
import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Flex, IconButton, LoadingSpinner, Drawer } from '@neo4j-ndl/react';
import { ClockIconOutline } from '@neo4j-ndl/react/icons';
import './Retrieval.css';
import retrievalIllustration from '../assets/retrieval.png';

import { setDriver, runQuery } from '../utils/Driver';

import { ResetZoomIcon, FitToScreenIcon } from '@neo4j-ndl/react/icons';

import type NVL from '@neo4j-nvl/base';

import type { HitTargets, Node, Relationship } from '@neo4j-nvl/base';
import { InteractiveNvlWrapper } from '@neo4j-nvl/react';
import type { MouseEventCallbacks } from '@neo4j-nvl/react';
import ReactMarkdown from 'react-markdown';

type CypherProps = {
  uri?: string;
  username?: string;
  password?: string;
};

function RetrievalInformation({ sources, model, entities, timeTaken }) {

  const nvl = useRef<NVL | null>(null);
  const [uri, setURI] = useState(import.meta.env.VITE_NEO4J_URI);
  const [username, setUsername] = useState(import.meta.env.VITE_NEO4J_USERNAME);
  const [password, setPassword] = useState(import.meta.env.VITE_NEO4J_PASSWORD);
  const [loading, setLoading] = useState(true);
  const [isExpanded, handleIsExpanded] = useState(false);
  const [expandedNode, setExpandedNode] = useState(null);

  const handleExpand = (nodes, hitTargets, evt) => {
    setExpandedNode(nodes);
    handleIsExpanded(true);
  }

  useEffect(() => {
    run();

  }, []);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [rels, setRels] = useState<Relationship[]>([]);

  const fitNodes = () => {
    nvl.current?.fit(nodes.map((n) => n.id));
  };
  const resetZoom = () => {
    nvl.current?.resetZoom();
  };

  const mouseEventCallbacks: MouseEventCallbacks = {
    onHover: (element: Node | Relationship, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onHover', element, hitTargets, evt),
    onRelationshipRightClick: (rel: Relationship, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onRelationshipRightClick', rel, hitTargets, evt),
    onNodeClick: (node: Node, hitTargets: HitTargets, evt: MouseEvent) =>
      handleExpand(node, hitTargets, evt),
    onNodeRightClick: (node: Node, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onNodeRightClick', node, hitTargets, evt),
    onNodeDoubleClick: (node: Node, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onNodeDoubleClick', node, hitTargets, evt),
    onRelationshipClick: (rel: Relationship, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onRelationshipClick', rel, hitTargets, evt),
    onRelationshipDoubleClick: (rel: Relationship, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onRelationshipDoubleClick', rel, hitTargets, evt),
    onCanvasClick: (evt: MouseEvent) => console.log('onCanvasClick', evt),
    onCanvasDoubleClick: (evt: MouseEvent) => console.log('onCanvasDoubleClick', evt),
    onCanvasRightClick: (evt: MouseEvent) => console.log('onCanvasRightClick', evt),
    onDrag: (nodes: Node[]) => console.log('onDrag', nodes),
    onPan: (evt: MouseEvent) => console.log('onPan', evt),
    onZoom: (zoomLevel: number) => console.log('onZoom', zoomLevel),
  };

  function run() {
    const formattedSources = sources.map((source) => `"${source}"`).join(',');

    const query1 = `
    MATCH (a:Chunk)-[r:PART_OF_DOCUMENT]->(d:Document)
    WHERE elementId(a) in [${formattedSources}]
    MATCH (b:Entity)<-[r2:HAS_ENTITY]-(a)
    WHERE elementId(b) in [${formattedSources}]
    MATCH (a)-[r3:NEXT_CHUNK]-(c)
    WHERE elementId(a) in [${formattedSources}] AND elementId(c) in [${formattedSources}]
    MATCH (d)-[r4:PART_OF_DOCUMENT]-(e:Image|Table)-[r5:HAS_ENTITY]->(b)
    RETURN DISTINCT a,b,c,d,e,r,r2,r3,r4,r5 LIMIT 250
    `;

    const query2 = `
    MATCH (a:Chunk)-[r2:PART_OF]-(d:Document)
    WHERE elementId(a) in [${formattedSources}]
    MATCH (a)-[r]-(b)
    WHERE elementId(b) IN [${formattedSources}]
    RETURN a,b,r,r2,d LIMIT 100
    `;

    setDriver(uri, username, password).then((isSuccessful) => {
      runQuery(query1).then((result) => {
        result.nodes.map((record: any) => {

          const label = record.labels.includes('Entity')
            ? record.properties.text
            : record.labels.includes('Document')
            ? record.labels
            : record.properties.type


          const color = record.labels.includes('Chunk')
            ? '#0A6190'
            : record.labels.includes('Document')
            ? '#BCF194'
            : record.labels.includes('Entity')
            ? '#B38EFF'
            : record.labels.includes('Image')
            ? '#FFC300'
            : '#FF8E6A'

          setNodes((prevNodes) => [
            ...prevNodes,
            { id: record.id.toString(), color: color, captions: [{ value: label, labels: record.labels }], properties: record.properties },
          ]);
        });

        result.rels.map((record: any) => {
          setRels((prevRels) => [
            ...prevRels,
            {
              id: record.id.toString(),
              from: record.start.toString(),
              to: record.end.toString(),
              captions: [{ value: record.type.toString() }],
            },
          ]);
        });
        setLoading(false);
      });
    });
  }

  return (
    <Box className='n-bg-palette-neutral-bg-weak p-4'>
      <Flex flexDirection='row' className='flex flex-row p-6 items-center'>
        <img src={retrievalIllustration} alt='icon' style={{ width: 95, height: 95, marginRight: 10 }} />
        <Box className='flex flex-col'>
          <Typography variant='h2'>Retrieval information</Typography>
          <Typography className='mb-2' variant='body-medium'>
            To generate this response, we used the model <span className='font-bold italic'>{model}</span>.
            <Typography className='pl-1 italic' variant='body-small'>
              <ClockIconOutline className='w-4 h-4 inline-block mb-1' /> {timeTaken / 1000} seconds
            </Typography>
          </Typography>
        </Box>
      </Flex>
      <Box className='button-container' sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <div
          style={{
            margin: 10,
            borderRadius: 25,
            border: '2px solid #2AADA5',
            height: 650,
            background: `rgb(var(--theme-palette-primary-bg-weaker));`,
            boxShadow: `2px -2px 10px grey`,
            position: 'relative',
          }}
        >
          <Flex
            flexDirection='row'
            className='flex flex-row p-6'
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 1000,
            }}
          >
            <IconButton className='n-size-token-7' ariaLabel='Fit to screen' onClick={fitNodes}>
              <FitToScreenIcon />
            </IconButton>
            <IconButton className='n-size-token-7' ariaLabel='Reset zoom' onClick={resetZoom}>
              <ResetZoomIcon />
            </IconButton>
          </Flex>
          {loading ? (
            <LoadingSpinner
              size='large'
              style={{
                position: 'absolute',
                top: '50%',
                right: '50%',
              }}
            />
          ) : (
            <></>
          )}
          <InteractiveNvlWrapper
            ref={nvl}
            nodes={nodes}
            rels={rels}
            onClick={(evt) => console.log('custom click event', evt)}
            mouseEventCallbacks={mouseEventCallbacks}
            nvlOptions={{
              initialZoom: 0,
              layout: 'd3Force',
              relationshipThreshold: 1,
            }}
          />
          <Box className='max-w-[300px]'>
            <Drawer isCloseable={true} isExpanded={isExpanded} position="left" type="overlay" onExpandedChange={() => {
              handleIsExpanded(false);
            }}>
              <Drawer.Header>Node details</Drawer.Header>
              <Drawer.Body className='max-w-[300px]'>
                {expandedNode?.captions[0]?.labels?.includes('Chunk')
                ? (<Typography variant='h5'>Text Chunk: </Typography>)
                : expandedNode?.captions[0]?.labels?.includes('Document')
                ? (<Typography variant='h5'>Document: </Typography>)
                : expandedNode?.captions[0]?.labels?.includes('Entity')
                ? (<Typography variant='h5'>Entity: </Typography>)
                : expandedNode?.captions[0]?.labels?.includes('Image')
                ? (<Typography variant='h5'>Image: </Typography>)
                : expandedNode?.captions[0]?.labels?.includes('Table')
                ? (<Typography variant='h5'>Table: </Typography>)
                : (<Typography variant='h5'>Other: </Typography>)}

                {expandedNode?.properties?.type === 'NarrativeText' || expandedNode?.captions[0]?.labels?.includes('Entity','Document')  && (
                  <ReactMarkdown>
                    {expandedNode.properties.text ?? expandedNode.properties.name ?? expandedNode.properties.id}
                  </ReactMarkdown>
                )}

                {expandedNode?.properties?.type === 'Image' && (
                  <img
                    src={`data:image/png;base64,${expandedNode?.properties?.image_base64}`}
                    alt="Preview"
                    className="w-full max-h-full object-top object-cover"
                  />
                )}

                {expandedNode?.properties?.type === 'Table' && (
                  <img
                    src={`data:image/png;base64,${expandedNode?.properties?.image_base64}`}
                    alt="Preview"
                    className="w-full max-h-full object-top object-cover"
                  />
                )}

                {expandedNode?.properties?.type === 'Table' && (
                  <div
                    dangerouslySetInnerHTML={{ __html: expandedNode?.properties?.text_as_html }}
                    className="w-full max-h-full overflow-auto"
                  />
                )}
           </Drawer.Body>
            </Drawer>
          </Box>
        </div>
      </Box>
    </Box>
  );
}

export default RetrievalInformation;
