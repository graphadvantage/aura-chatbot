import React, { useState } from "react";
import { Box, Typography, Flex, IconButton, LoadingSpinner, Drawer } from '@neo4j-ndl/react';
//import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
//import { Button } from "@/components/ui/button";

import {contentImg} from './test-image';

import {contentTbl} from './test-table';


interface ModalProps {
  type: "image" | "table";
  content: string;
}



function ContentInformation({ type, content }) {

  function run() {
    const type = "Image";
    const content = contentImg;
  }

  console.log(type);
  
  return (
    <Box className='n-bg-palette-neutral-bg-weak p-4'>
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
          <div className="flex justify-center items-center">
              {type === "Image" ? (
                <img src={`data:image/png;base64,${ content }`} alt="Preview" className="max-w-full max-h-[400px]" />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: content }} className="overflow-auto max-h-[400px]" />
              )}
          </div>
          </Flex>
        </div>
      </Box>
    </Box>
  );
};

export default ContentInformation;
