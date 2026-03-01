import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, List, MapPin, Clock, DollarSign, Share2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { DayItinerary } from '../types';

export default function TripMapView() {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const [selectedDay, setSelectedDay] = useState(1);
  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [destination] = useState('San Francisco');

  useEffect(() => {
    // TODO: Fetch itinerary from backend
    // Mock data for now
    const mockItinerary: DayItinerary[] = [
      {
        day: 1,
        date: '2024-03-15',
        activities: [
          {
            name: 'Golden Gate Bridge',
            type: 'Adventure',
            durationHours: 2,
            costUSD: 0,
            location: 'Golden Gate Bridge, San Francisco',
            coordinates: { lat: 37.8199, lng: -122.4783 },
          },
          {
            name: "Fisherman's Wharf",
            type: 'Food & Dining',
            durationHours: 3,
            costUSD: 40,
            location: 'Pier 39, San Francisco',
            coordinates: { lat: 37.8087, lng: -122.4098 },
          },
          {
            name: 'Alcatraz Island Tour',
            type: 'Culture',
            durationHours: 3,
            costUSD: 45,
            location: 'Alcatraz Island',
            coordinates: { lat: 37.8267, lng: -122.4230 },
          },
        ],
        totalCostUSD: 85,
        transportMode: 'walk',
      },
      {
        day: 2,
        date: '2024-03-16',
        activities: [
          {
            name: 'Golden Gate Park',
            type: 'Nature',
            durationHours: 2,
            costUSD: 0,
            location: 'Golden Gate Park, San Francisco',
            coordinates: { lat: 37.7694, lng: -122.4862 },
          },
          {
            name: 'de Young Museum',
            type: 'Art & Culture',
            durationHours: 2,
            costUSD: 15,
            location: '50 Hagiwara Tea Garden Dr',
            coordinates: { lat: 37.7715, lng: -122.4686 },
          },
        ],
        totalCostUSD: 15,
        transportMode: 'subway',
      },
    ];

    setTimeout(() => {
      setItinerary(mockItinerary);
      setLoading(false);
    }, 500);
  }, [tripId]);

  const currentDay = itinerary.find((day) => day.day === selectedDay);

  return (
    <Layout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/home')}
                  className="p-2 hover:bg-primary-cream rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-primary-green" />
                </button>
                <h1 className="text-2xl font-bold text-primary-green">{destination}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/trip/${tripId}/list`)}
                  className="flex items-center gap-2"
                >
                  <List className="w-5 h-5" />
                  <span className="hidden md:inline">List View</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  <span className="hidden md:inline">Share</span>
                </Button>
              </div>
            </div>

            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {itinerary.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedDay === day.day
                      ? 'bg-primary-green text-white'
                      : 'bg-primary-green/10 text-primary-green hover:bg-primary-green/20'
                  }`}
                >
                  Day {day.day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map and Side Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Container */}
          <div className="flex-1 relative bg-primary-green/5">
            {/* Placeholder for map */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary-green/40 mx-auto mb-4" />
                <p className="text-primary-green/60">
                  Map integration coming soon
                </p>
                <p className="text-sm text-primary-green/40 mt-2">
                  Mapbox GL JS or Google Maps will be integrated here
                </p>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          {currentDay && (
            <div className="w-full md:w-96 bg-white border-l border-primary-green/10 overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-primary-green mb-4">
                  Day {currentDay.day} Activities
                </h2>

                <div className="space-y-4">
                  {currentDay.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="p-4 bg-primary-cream rounded-lg hover:bg-primary-cream/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary-green text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-primary-green mb-2">
                            {activity.name}
                          </h3>
                          <div className="space-y-1 text-sm text-primary-green/60">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{activity.location}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{activity.durationHours}h</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>${activity.costUSD}</span>
                              </div>
                            </div>
                          </div>
                          <span className="inline-block mt-2 px-2 py-1 bg-primary-green/10 text-primary-green text-xs rounded-full">
                            {activity.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary-green/10 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-green/70">Day Total:</span>
                    <span className="font-bold text-primary-green">
                      ${currentDay.totalCostUSD.toFixed(2)}
                    </span>
                  </div>
                  {currentDay.transportMode && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-primary-green/70">Transport:</span>
                      <span className="font-medium text-primary-green capitalize">
                        {currentDay.transportMode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
