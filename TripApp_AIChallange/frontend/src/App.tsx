import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InterestQuiz from './pages/InterestQuiz';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import NewTrip from './pages/NewTrip';
import TripQuestionnaire from './pages/TripQuestionnaire';
import TripListView from './pages/TripListView';
import TripMapView from './pages/TripMapView';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InterestQuiz />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/new-trip" element={<NewTrip />} />
        <Route path="/trip/questionnaire/:type" element={<TripQuestionnaire />} />
        <Route path="/trip/:tripId/list" element={<TripListView />} />
        <Route path="/trip/:tripId/map" element={<TripMapView />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
