import React, { useState } from "react";
import { Box, Typography, Flex, IconButton, LoadingSpinner, Drawer } from '@neo4j-ndl/react';
import './Retrieval.css';
import retrievalIllustration from '../assets/retrieval.png';

import {contentImg} from './test-image';

import {contentTbl} from './test-table';


interface ModalProps {
  type: "image" | "table";
  content: string;
}

//className="max-w-full max-h-[400px]"

function ContentInformation({ type, content }) {

  function run() {
    //const type = "Image";
    //const content = contentImg;
    //const type = "Table";
    //const content = contentTbl;
  }

  console.log(type);

  return (
    <Box className='n-bg-palette-neutral-bg-weak p-4'>
      <Flex flexDirection='row' className='flex flex-row p-6 items-center'>
        <img src={retrievalIllustration} alt='icon' style={{ width: 95, height: 95, marginRight: 10 }} />
        <Box className='flex flex-col'>
          <Typography variant='h2'>Images & Tables</Typography>
          <Typography className='mb-2' variant='body-medium'>
            Additional unstructured content related to the response.
          </Typography>
        </Box>
      </Flex>
      <Box className='button-container' sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <div
          style={{
            margin: 10,
            borderRadius: 25,
            border: '2px solid #2AADA5',
            maxHeight: 650,
            background: `rgb(var(--theme-palette-primary-bg-weaker))`,
            boxShadow: `2px -2px 10px grey`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Flex
            flexDirection='column'
            overflowY='auto'
            className='flex flex-col p-6 justify-start items-start'
            style={{
              maxHeight: '650px',
              position: 'relative',
              top: 0,
              right: 0,
              zIndex: 1000,
            }}
          >
            <div className='flex justify-start items-start overflow-auto w-full max-h-full'>
              {type === 'Image' ? (
                <img src={`data:image/png;base64,${content}`} alt='Preview' className='w-full max-h-full object-top object-cover' />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: content }} className='max-h-full w-full overflow-auto' />
              )}
            </div>
          </Flex>
        </div>
      </Box>
    </Box>
  );
};

export default ContentInformation;
