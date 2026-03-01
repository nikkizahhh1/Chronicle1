import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, MoreVertical, User } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Trip } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch trips from backend
    // Mock data for now
    setTimeout(() => {
      setTrips([]);
      setLoading(false);
    }, 500);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-green">My Trips</h1>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-primary-cream rounded-full transition-colors"
            >
              <User className="w-6 h-6 text-primary-green" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* New Trip Button */}
          <button
            onClick={() => navigate('/new-trip')}
            className="w-full mb-8 p-6 border-2 border-dashed border-primary-green/30 rounded-2xl hover:border-primary-green/50 hover:bg-white/50 transition-all flex items-center justify-center gap-3 text-primary-green"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg font-medium">Start New Trip</span>
          </button>

          {/* Trips Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary-green/60">Loading trips...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-primary-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-primary-green/40" />
              </div>
              <p className="text-primary-green/60 mb-2">No trips yet</p>
              <p className="text-primary-green/40 text-sm">
                Start planning your first adventure
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <Card
                  key={trip.trip_id}
                  onClick={() => navigate(`/trip/${trip.trip_id}/map`)}
                  className="p-0 overflow-hidden"
                >
                  {/* Trip Image Placeholder */}
                  <div className="h-40 bg-gradient-to-br from-primary-teal to-primary-green" />

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-primary-green">
                        {trip.destination}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Show menu
                        }}
                        className="p-1 hover:bg-primary-cream rounded transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-primary-green/60" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-primary-green/60">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          trip.status === 'planned'
                            ? 'bg-primary-gold/20 text-primary-gold'
                            : trip.status === 'in_progress'
                            ? 'bg-primary-teal/20 text-primary-teal'
                            : 'bg-primary-green/20 text-primary-green'
                        }`}
                      >
                        {trip.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
