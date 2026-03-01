import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';

export default function NewTrip() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-primary-cream rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-primary-green" />
            </button>
            <h1 className="text-2xl font-bold text-primary-green">New Trip</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-green mb-3">
              What type of trip are you planning?
            </h2>
            <p className="text-primary-green/70">
              Choose your adventure style
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Trip */}
            <Card
              onClick={() => navigate('/trip/questionnaire/location')}
              className="p-8 text-center hover:scale-105 transition-transform"
            >
              <div className="w-20 h-20 bg-primary-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-primary-teal" />
              </div>
              <h3 className="text-2xl font-bold text-primary-green mb-3">
                Find Things Near Me
              </h3>
              <p className="text-primary-green/70">
                Discover amazing activities and attractions in a specific location
              </p>
            </Card>

            {/* Road Trip */}
            <Card
              onClick={() => navigate('/trip/questionnaire/roadtrip')}
              className="p-8 text-center hover:scale-105 transition-transform"
            >
              <div className="w-20 h-20 bg-primary-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-10 h-10 text-primary-orange" />
              </div>
              <h3 className="text-2xl font-bold text-primary-green mb-3">
                Plan a Road Trip
              </h3>
              <p className="text-primary-green/70">
                Create an epic journey with stops along the way to your destination
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
