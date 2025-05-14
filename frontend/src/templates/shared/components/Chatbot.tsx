/* eslint-disable no-confusing-arrow */
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Widget,
  Typography,
  Avatar,
  TextInput,
  IconButton,
  LoadingSpinner,
  Modal,
} from '@neo4j-ndl/react';

import {
  ClipboardDocumentIconOutline,
  ArrowPathIconOutline,
  SpeakerWaveIconOutline,
  InformationCircleIconOutline,
} from '@neo4j-ndl/react/icons';

import { PiGraphBold } from "react-icons/pi";

import { HiOutlineThumbDown, HiOutlineThumbUp } from "react-icons/hi";

import { useCopyToClipboard } from '@neo4j-ndl/react';

import ChatBotAvatar from '../assets/chatbot-ai.png';

import './Chatbot.css';
import ReactMarkdown from 'react-markdown';

import { v4 as uuidv4 } from 'uuid';
import remarkGfm from 'remark-gfm';

import axios from 'axios';

import { setDriver, runQuery } from '../utils/Driver';

import RetrievalInformation from './RetrievalInformation';

import Header from './Header';

const url = () => {
  let url = window.location.href.replace('3001', '8000');
  if (process.env.VITE_BACKEND_URL) {
    url = process.env.VITE_BACKEND_URL;
  }
  return !url || !url.match('/$') ? url : url.substring(0, url.length - 1);
};

type ChatbotProps = {
  messages: {
    id: number;
    user: string;
    message: string;
    datetime: string;
    isTyping?: boolean;
    typeMessage?: string;
    sources?: string[];
    entities?: string[];
    model?: string;
    timeTaken?: number;
  }[];
};

interface AudioInfo {
  id: number;
  URL: string;
}

type User = {
  email?: string;
  name?: string;
  token?: string;
};

const chatBotAPI = async (question: string, sessionId?: string) => {
  try {
    const startTime = Date.now();
    const response: any = await axios.post(import.meta.env.VITE_BACKEND_URL, {
      question: question,
      session_id: sessionId || sessionStorage.getItem('session_id')
    });
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    return { response: response.data, timeTaken: timeTaken };
  } catch (error) {
    console.log('ERR: ', error);
    console.log('Error Posting the Question:', error);
    throw error;
  }
};

export default function Chatbot(props: ChatbotProps) {
  const { messages } = props;
  const [listMessages, setListMessages] = useState<ChatbotProps['messages']>([]);
  const [inputMessage, setInputMessage] = useState('');
  const formattedTextStyle = { color: 'rgb(var(--theme-palette-discovery-bg-strong))' };
  const [loading, setLoading] = useState<boolean>(false);
  //const [negativeFeedback, setNegativefeedback] = useState<boolean>(false);
  //const [negativeFeedbackMessage, setNegativefeedbackMessage] = useState<string>('');
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<AudioInfo[]>([]);
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const [loadingPlaying, setLoadingPlaying] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const handleCloseModal = () => setIsOpenModal(false);
  const [sourcesModal, setSourcesModal] = useState<string[]>([]);
  const [entitiesModal, setEntitiesModal] = useState<string[]>([]);
  const [modelModal, setModelModal] = useState<string>('');
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [value, copy] = useCopyToClipboard();
  //const [handleFeedback, setHandlefeedback] = useState<boolean>(false);

  const [activeNavItem, setActiveNavItem] = useState<string>('Chatbot');

  const [user, setUser] = useState<User>({});

  const chatBotVoice = async (message: string) => {
    try {
      const data = {
        model: 'tts-1-hd',
        voice: 'nova',
        input: message,
      };
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        data,
        {
          headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );
      const url = URL.createObjectURL(response.data);
      return url;
    } catch (error) {
      console.log('Error Posting the Question:', error);
      throw error;
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const simulateTypingEffect = (
    response: { reply: string; entities?: [string]; model?: string; sources?: [string]; timeTaken?: number },
    index = 0
  ) => {
    if (index < response.reply.length) {
      const nextIndex = index + 1;
      const currentTypedText = response.reply.substring(0, nextIndex);
      if (index === 0) {
        const date = new Date();
        const datetime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        if (response.reply.length <= 1) {
          setListMessages((msgs) => [
            ...msgs,
            {
              id: Date.now(),
              user: 'chatbot',
              message: currentTypedText,
              datetime: datetime,
              isTyping: true,
              sources: response?.sources,
              entities: response?.entities,
              model: response?.model,
              timeTaken: response?.timeTaken,
            },
          ]);
        } else {
          setListMessages((msgs) => {
            const lastmsg = { ...msgs[msgs.length - 1] };
            lastmsg.id = Date.now();
            lastmsg.user = 'chatbot';
            lastmsg.message = currentTypedText;
            lastmsg.datetime = datetime;
            lastmsg.isTyping = true;
            lastmsg.sources = response?.sources;
            lastmsg.entities = response?.entities;
            lastmsg.model = response?.model;
            lastmsg.timeTaken = response?.timeTaken;
            return msgs.map((msg, index) => {
              if (index === msgs.length - 1) {
                return lastmsg;
              }
              return msg;
            });
          });
        }
      } else {
        setListMessages((msgs) => msgs.map((msg) => (msg.isTyping ? { ...msg, message: currentTypedText } : msg)));
      }
      setTimeout(() => simulateTypingEffect(response, nextIndex), 3);
    } else {
      setListMessages((msgs) => msgs.map((msg) => (msg.isTyping ? { ...msg, isTyping: false } : msg)));
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!inputMessage.trim()) {
      return;
    }
    const date = new Date();
    const datetime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    const inputvoice = Date.now();
    const userMessage = { id: Date.now(), user: 'user', message: inputMessage, datetime: datetime, voiceID: '' };
    setListMessages((listMessages) => [...listMessages, userMessage]);
    setLoading(true);
    setInputMessage('');
    simulateTypingEffect({ reply: ' ' });

    let chatSources;
    let chatModel;
    let chatEntities;
    const callAxios = await chatBotAPI(inputMessage, sessionId);
    const chatresponse = callAxios.response;
    let chatbotReply = chatresponse.response;
    chatSources = chatresponse.src.flatMap((source: { listIds: string[] }) => source.listIds);
    chatModel = 'OpenAI GPT o3-mini';
    chatEntities = chatresponse.src;

    const chatTimeTaken = callAxios.timeTaken;
    const voiceid = Date.now();
    simulateTypingEffect({
      reply: chatbotReply,
      entities: chatEntities,
      model: chatModel,
      sources: chatSources,
      timeTaken: chatTimeTaken,
    });
    setLoading(false);
  };

  const scrollToBottom = () => {
    //messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [listMessages]);

  useEffect(() => {
    if (!sessionStorage.getItem('session_id')) {
      const id = uuidv4();
      setSessionId(id);
      sessionStorage.setItem('session_id', id);
    }
  }, []);

  function playAudio(id) {
    const audio = new Audio(id);
    audio.play().catch((error) => console.error('Error playing the audio:', error));
  }

/*
  const handleNegativeFeedback = (target) => {
    setNegativefeedbackMessage(target);
    setNegativefeedback(true);
  };
*/
  useEffect(() => {
    const initialMessage = {
      id: 1,
      message: `Hello! I'm a Chatbot built on a Neo4j Knowledge Graph.
      \n I can help you answer any questions you might have.
      \n How can I help you today?`,
      user: 'chatbot',
      datetime: '01/01/2024 00:00:00',
      typeMessage: 'First',
    };
    setListMessages([initialMessage]);
    simulateTypingEffect({ reply: initialMessage.message });
  }, []);

  const submitFeedback = async (sessionId: string, feedback: string) => {
    console.log('Submitting feedback for sessionId:', sessionId);
    const updateMessage = `
      MATCH (a:Session {id: '${sessionId}'})-[r:LAST_MESSAGE]->(b)
      SET b.feedback = '${feedback}'
      RETURN a,r,b
    `;

    const isSuccessful = await setDriver(
      import.meta.env.VITE_NEO4J_URI,
      import.meta.env.VITE_NEO4J_USERNAME,
      import.meta.env.VITE_NEO4J_PASSWORD
    );
    if (isSuccessful) {
      runQuery(updateMessage, { sessionId, feedback });
    }
  };


  return (
    <>
      <Header
        title='GraphRAG Using Vector+FullText Retriever with Traversal to Adjacent Context'
        useNeo4jConnect={false}
      />
      <div className='n-bg-palette-neutral-bg-default flex flex-col justify-between min-h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden'>
      <div className='flex overflow-y-auto pb-12 min-w-full'>
              <Widget className='n-bg-palette-neutral-bg-default w-full h-full' header='' isElevated={false}>
                <div className='flex flex-col gap-3 p-3 pr-6 pl-6'>
                  {listMessages.map((chat, index) => (
                    <div
                      ref={messagesEndRef}
                      key={chat.id}
                      className={`flex gap-2.5 items-end ${chat.user === 'chatbot' ? 'flex-row' : 'flex-row-reverse'} `}
                    >
                      <div className='w-8 h-8'>
                        {chat.user === 'chatbot' ? (
                          <Avatar
                            className='-ml-4'
                            hasStatus
                            name='KM'
                            shape='square'
                            size='x-large'
                            source={ChatBotAvatar}
                            status='online'
                            type='image'
                          />
                        ) : (
                          <Avatar
                            className=''
                            hasStatus
                            name='KM'
                            size='x-large'
                            status='online'
                            type='image'
                            shape='square'
                          />
                        )}
                      </div>
                      <Widget
                        header=''
                        isElevated={true}
                        className={`p-4 self-start max-w-[55%] ${
                          chat.user === 'chatbot' && chat.typeMessage != 'Feedback'
                            ? 'n-bg-palette-neutral-bg-weak'
                            : chat.typeMessage == 'Feedback'
                            ? 'n-bg-palette-success-bg-status n-text-palette-neutral-text-inverse'
                            : 'n-bg-palette-primary-bg-weak'
                        }`}
                      >
                        <div
                          className={`${
                            loading && index === listMessages.length - 1 && chat.user == 'chatbot' ? 'loader' : ''
                          }`}
                        >
                          {loading && index === listMessages.length - 1 && chat.user == 'chatbot' ? (
                            <LoadingSpinner size='large' className='ml-[40%] self-center justify-center align-middle' />
                          ) : (
                            <></>
                          )}
                          <ReactMarkdown children={chat.message} remarkPlugins={[remarkGfm]} />
                        </div>
                        <div className='text-right align-bottom pt-3'>
                          <Typography variant='body-small'>{chat.datetime}</Typography>
                        </div>
                        <Typography variant='body-small' className='text-right'>
                          {chat.user === 'chatbot' && chat.typeMessage != 'Feedback' ? (
                            <div className='flex gap-1'>
                              {chat.typeMessage != 'First' ? (
                                <>
                                  <IconButton
                                    isClean
                                    isDisabled={loadingPlaying || loading}
                                    ariaLabel='Speaker Icon'
                                    onClick={() => {
                                      setLoadingPlaying(true);
                                      chatBotVoice(chat.message).then((url) => {
                                        setLoadingPlaying(false);
                                        playAudio(url);
                                      });
                                    }}
                                  >
                                    <SpeakerWaveIconOutline className='w-4 h-4 inline-block' />
                                  </IconButton>
                                  <IconButton
                                    isClean
                                    ariaLabel='Information Icon'
                                    onClick={() => {
                                      setEntitiesModal(chat.entities ?? []);
                                      setModelModal(chat.model ?? '');
                                      setSourcesModal(chat.sources ?? []);
                                      setTimeTaken(chat.timeTaken ?? 0);
                                      setIsOpenModal(true);
                                    }}
                                    isDisabled={loading}
                                  >
                                    <PiGraphBold className='w-4 h-4 inline-block' />
                                  </IconButton>
                                  <IconButton isDisabled={loading} isClean ariaLabel='Copy Icon' onClick={() => copy(chat.message)}>
                                    <ClipboardDocumentIconOutline className='w-4 h-4 inline-block' />
                                  </IconButton>
                                  <IconButton isDisabled={loading} isClean ariaLabel='Thumbs Up Icon' onClick={() =>  { submitFeedback(sessionId, 'good'); console.log(sessionId);}}>
                                    <HiOutlineThumbUp className='w-4 h-4 inline-block' />
                                  </IconButton>
                                  <IconButton isDisabled={loading} isClean ariaLabel='Thumbs Down Icon' onClick={() => { submitFeedback(sessionId, 'poor'); console.log(sessionId);}}>
                                    <HiOutlineThumbDown className='w-4 h-4 inline-block'/>
                                  </IconButton>
                                  {/*
                                  </IconButton isDisabled={loading} isClean ariaLabel='Refresh Icon'>
                                    <ArrowPathIconOutline
                                      className='w-4 h-4 inline-block'
                                      onClick={async () => {
                                        setLoading(true);
                                        setListMessages((msgs) =>
                                          msgs.map((msg) => (msg.id === chat.id ? { ...msg, message: '' } : msg))
                                        );
                                        const callAxios = await chatBotAPI(chat.message, sessionId);
                                        const chatresponse = callAxios.response;
                                        let chatbotReply = chatresponse.response;
                                        const chatSources = chatresponse.src.map((source: { id: string }) => source.id);
                                        const chatModel = 'OpenAI GPT 4';
                                        const chatEntities = chatresponse.src;
                                        const chatTimeTaken = callAxios.timeTaken;
                                        simulateTypingEffect({
                                          reply: chatbotReply,
                                          entities: chatEntities,
                                          model: chatModel,
                                          sources: chatSources,
                                          timeTaken: chatTimeTaken,
                                        });
                                        setLoading(false);
                                      }}
                                    />
                                  </IconButton>
                                  */}
                                </>
                              ) : (
                                <>
                                  <IconButton
                                    isClean
                                    isDisabled={loadingPlaying}
                                    ariaLabel='Search Icon'
                                    onClick={() => {
                                      setLoadingPlaying(true);
                                      chatBotVoice(
                                        listMessages[0].message
                                      ).then((url) => {
                                        setLoadingPlaying(false);
                                        playAudio(url);
                                      });
                                    }}
                                  >
                                    <SpeakerWaveIconOutline className='w-4 h-4 inline-block' />
                                  </IconButton>
                                </>
                              )}
                            </div>
                          ) : (
                            <></>
                          )}
                        </Typography>
                      </Widget>
                    </div>
                  ))}
                </div>
              </Widget>
            </div>
            <div className='n-bg-palette-neutral-bg-default flex gap-2.5 bottom-0 p-2.5 w-full'>
              <form onSubmit={handleSubmit} className='flex gap-2.5 w-full'>
                <TextInput
                  className='n-bg-palette-neutral-bg-default flex-grow-7 w-full'
                  type='text'
                  value={inputMessage}
                  isFluid
                  onChange={handleInputChange}
                />
                <Button type='submit'>Submit</Button>
              </form>
            </div>
            <Modal
              modalProps={{
                id: 'default-menu',
                className: 'n-p-token-4 n-bg-palette-neutral-bg-weak n-rounded-lg max-h-[90%] min-w-[60%]',
              }}
              onClose={handleCloseModal}
              isOpen={isOpenModal}
            >
              <RetrievalInformation
                sources={sourcesModal}
                entities={entitiesModal}
                model={modelModal}
                timeTaken={timeTaken}
              />
            </Modal>
      </div>
    </>
  );
}
