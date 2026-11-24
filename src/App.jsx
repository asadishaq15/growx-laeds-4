import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';

import GrowxAutoLnForm from './Components/GrowxAutoLnForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auto-ln" element={<GrowxAutoLnForm />} />
      </Routes>
    </Router>
  );
}

export default App;
