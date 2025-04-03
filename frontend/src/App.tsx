import { BrowserRouter, Routes, Route } from 'react-router-dom';

import '@neo4j-ndl/base/lib/neo4j-ds-styles.css';

import ThemeWrapper from './context/ThemeWrapper';

import PageNotFound from './templates/shared/components/PageNotFound';
import Chatbot from './templates/shared/components/Chatbot';
import messagesData from './templates/shared/assets/ChatbotMessages.json';

function App() {
  const messages = messagesData.listMessages;
  return (
    <BrowserRouter>
      <ThemeWrapper>
        <Routes>
          <Route
            path='/'
            element={
                <Chatbot messages={messages} />

            }
          />
          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </ThemeWrapper>
    </BrowserRouter>
  );
}

export default App;
